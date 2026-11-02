import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(
    `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_coupon_id TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_coupon_code TEXT`
  );

  return NextResponse.json({
    success: true,
    message: "Kolom is_public (coupons) + shipping_coupon_id/code (orders) berhasil ditambahkan",
  });
}
