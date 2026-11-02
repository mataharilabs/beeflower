export type PromotionType = "PRODUCT_DISCOUNT" | "ORDER_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
export type DiscountMode = "FIXED" | "PERCENTAGE";

export interface ActivePromotion {
  id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  discountMode: DiscountMode | null;
  discountValue: number | null;
  minimumPurchase: number | null;
  applyToAll: boolean;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  buyProductId: string | null;
  buyProductName: string | null;
  buyQuantity: number | null;
  getProductId: string | null;
  getProductName: string | null;
  getQuantity: number | null;
  getDiscountMode: DiscountMode | null;
  getDiscountValue: number | null;
  applicableCities: string[];
  startAt: string;
  endAt: string;
}

export interface ProductDiscountResult {
  discountMode: DiscountMode;
  discountValue: number;
  discountedPrice: number;
  discountPercent: number;
  promo: ActivePromotion;
}

export function getProductDiscount(
  productId: string,
  categoryId: string | null,
  price: number,
  promotions: ActivePromotion[]
): ProductDiscountResult | null {
  const candidates = promotions.filter(
    (p) =>
      p.type === "PRODUCT_DISCOUNT" &&
      p.discountMode != null &&
      p.discountValue != null &&
      (p.applyToAll ||
        p.applicableProductIds.includes(productId) ||
        (categoryId != null && p.applicableCategoryIds.includes(categoryId)))
  );
  if (!candidates.length) return null;

  let best = candidates[0];
  let bestSaving = 0;
  for (const p of candidates) {
    const saving =
      p.discountMode === "PERCENTAGE"
        ? (price * (p.discountValue ?? 0)) / 100
        : (p.discountValue ?? 0);
    if (saving > bestSaving) {
      bestSaving = saving;
      best = p;
    }
  }

  const mode = best.discountMode!;
  const value = best.discountValue!;
  const discountedPrice =
    mode === "PERCENTAGE"
      ? Math.max(0, price * (1 - value / 100))
      : Math.max(0, price - value);
  const discountPercent =
    mode === "PERCENTAGE"
      ? value
      : price > 0
      ? Math.round((value / price) * 100)
      : 0;

  return { discountMode: mode, discountValue: value, discountedPrice, discountPercent, promo: best };
}

export function findBuyXGetYForProduct(
  productId: string,
  promotions: ActivePromotion[]
): ActivePromotion | null {
  return (
    promotions.find((p) => p.type === "BUY_X_GET_Y" && p.buyProductId === productId) ?? null
  );
}

export function getOrderDiscountPromos(
  subtotal: number,
  promotions: ActivePromotion[]
): { totalDiscount: number; promos: ActivePromotion[] } {
  let totalDiscount = 0;
  const matched: ActivePromotion[] = [];
  for (const p of promotions) {
    if (p.type !== "ORDER_DISCOUNT") continue;
    if (p.minimumPurchase != null && subtotal < p.minimumPurchase) continue;
    if (!p.discountValue || !p.discountMode) continue;
    const disc =
      p.discountMode === "PERCENTAGE"
        ? (subtotal * p.discountValue) / 100
        : p.discountValue;
    totalDiscount += disc;
    matched.push(p);
  }
  return { totalDiscount, promos: matched };
}

export function getFreeShippingPromos(
  city: string,
  subtotal: number,
  promotions: ActivePromotion[]
): ActivePromotion[] {
  return promotions.filter((p) => {
    if (p.type !== "FREE_SHIPPING") return false;
    if (p.minimumPurchase != null && subtotal < p.minimumPurchase) return false;
    if (
      p.applicableCities.length > 0 &&
      !p.applicableCities.some((c) => c.toLowerCase() === city.toLowerCase())
    )
      return false;
    return true;
  });
}
