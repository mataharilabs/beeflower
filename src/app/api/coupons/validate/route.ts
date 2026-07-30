import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCouponUsable, calculateCouponDiscount } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, items, city, subtotal, shippingCost } = body;

  if (!code) {
    return NextResponse.json({ valid: false, error: "Kode kupon tidak boleh kosong" });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: String(code).toUpperCase() },
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Kode kupon tidak valid" });
  }

  if (!isCouponUsable(coupon)) {
    const status = coupon.isStopped ? "dihentikan" : coupon.isPaused ? "dijeda" : "tidak aktif";
    return NextResponse.json({ valid: false, error: `Kupon telah ${status}` });
  }

  if (!coupon.isUnlimited && coupon.quota != null && coupon.usedCount >= coupon.quota) {
    return NextResponse.json({ valid: false, error: "Kuota kupon telah habis" });
  }

  // Check product condition
  if (coupon.applicableProductIds.length > 0 && items?.length > 0) {
    const itemProductIds: string[] = items.map((i: { productId: string }) => i.productId);
    const allMatch = itemProductIds.every((pid: string) => coupon.applicableProductIds.includes(pid));
    if (!allMatch) {
      return NextResponse.json({ valid: false, error: "Kupon tidak berlaku untuk produk ini" });
    }
  }

  // Check city condition
  if (coupon.applicableCities.length > 0 && city) {
    const cityLower = String(city).toLowerCase();
    const matches = coupon.applicableCities.some((c) => c.toLowerCase() === cityLower);
    if (!matches) {
      return NextResponse.json({ valid: false, error: "Kupon tidak berlaku untuk kota ini" });
    }
  }

  const discount = calculateCouponDiscount(
    coupon.discountMode,
    coupon.discountType,
    Number(coupon.discountValue.toString()),
    Number(subtotal ?? 0),
    Number(shippingCost ?? 0),
  );

  return NextResponse.json({
    valid: true,
    discount,
    discountType: coupon.discountType,
    couponId: coupon.id,
    code: coupon.code,
    title: coupon.title,
  });
}
