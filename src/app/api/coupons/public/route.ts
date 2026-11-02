import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { isPublic: true, isStopped: false, isPaused: false },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      imageUrl: true,
      discountType: true,
      discountMode: true,
      discountValue: true,
      isLifetime: true,
      startAt: true,
      endAt: true,
      isUnlimited: true,
      quota: true,
      usedCount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const active = coupons.filter((c) => {
    if (!c.isLifetime) {
      if (c.endAt && c.endAt < now) return false;
      if (c.startAt && c.startAt > now) return false;
    }
    if (!c.isUnlimited && c.quota != null && c.usedCount >= c.quota) return false;
    return true;
  });

  return NextResponse.json(active);
}
