import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch getProduct details for BUY_X_GET_Y promos
    const getProductIds = [
      ...new Set(
        promotions
          .filter((p) => p.type === "BUY_X_GET_Y" && p.getProductId)
          .map((p) => p.getProductId!)
      ),
    ];
    const getProducts =
      getProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: getProductIds }, isActive: true },
            select: { id: true, images: true, slug: true },
          })
        : [];
    const getProductMap = new Map(getProducts.map((p) => [p.id, p]));

    return NextResponse.json(
      promotions.map((p) => ({
        ...p,
        discountValue: p.discountValue ? Number(p.discountValue.toString()) : null,
        minimumPurchase: p.minimumPurchase ? Number(p.minimumPurchase.toString()) : null,
        getDiscountValue: p.getDiscountValue ? Number(p.getDiscountValue.toString()) : null,
        getProductImage:
          p.getProductId ? (getProductMap.get(p.getProductId)?.images[0] ?? null) : null,
        getProductSlug:
          p.getProductId ? (getProductMap.get(p.getProductId)?.slug ?? null) : null,
        startAt: p.startAt.toISOString(),
        endAt: p.endAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
