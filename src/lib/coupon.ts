import { CouponDiscountMode, CouponDiscountType } from "@prisma/client";

interface CouponStatusInput {
  isStopped: boolean;
  isPaused: boolean;
  isLifetime: boolean;
  startAt: Date | null;
  endAt: Date | null;
}

export type CouponStatus = "RUNNING" | "PENDING" | "ENDED" | "PAUSE" | "STOPPED";

export function computeCouponStatus(coupon: CouponStatusInput): CouponStatus {
  if (coupon.isStopped) return "STOPPED";
  if (coupon.isPaused) return "PAUSE";
  if (!coupon.isLifetime) {
    const now = new Date();
    if (coupon.endAt && coupon.endAt < now) return "ENDED";
    if (coupon.startAt && coupon.startAt > now) return "PENDING";
  }
  return "RUNNING";
}

export function isCouponUsable(coupon: CouponStatusInput & { isUnlimited: boolean; quota: number | null; usedCount: number }): boolean {
  if (computeCouponStatus(coupon) !== "RUNNING") return false;
  if (!coupon.isUnlimited && coupon.quota != null && coupon.usedCount >= coupon.quota) return false;
  return true;
}

export function calculateCouponDiscount(
  discountMode: CouponDiscountMode,
  discountType: CouponDiscountType,
  discountValue: number,
  subtotal: number,
  shippingCost: number,
): number {
  if (discountMode === "FIXED") {
    const base = discountType === "PRODUCT" ? subtotal : shippingCost;
    return Math.min(discountValue, base);
  } else {
    const base = discountType === "PRODUCT" ? subtotal : shippingCost;
    return Math.floor((base * discountValue) / 100);
  }
}
