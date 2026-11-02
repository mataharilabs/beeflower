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

    return NextResponse.json(
      promotions.map((p) => ({
        ...p,
        discountValue: p.discountValue ? Number(p.discountValue.toString()) : null,
        minimumPurchase: p.minimumPurchase ? Number(p.minimumPurchase.toString()) : null,
        getDiscountValue: p.getDiscountValue ? Number(p.getDiscountValue.toString()) : null,
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
