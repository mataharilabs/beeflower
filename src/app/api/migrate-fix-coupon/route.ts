import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check existing columns
  const columnCheck = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'coupons'
      AND column_name IN ('is_public')
    UNION
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'orders'
      AND column_name IN ('shipping_coupon_id', 'shipping_coupon_code')
  `;

  const existingCols = columnCheck.map((r) => r.column_name);
  const results: string[] = [];

  if (!existingCols.includes("is_public")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE coupons ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false`
    );
    results.push("✓ is_public ditambahkan ke coupons");
  } else {
    results.push("— is_public sudah ada di coupons");
  }

  if (!existingCols.includes("shipping_coupon_id")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders ADD COLUMN shipping_coupon_id TEXT`
    );
    results.push("✓ shipping_coupon_id ditambahkan ke orders");
  } else {
    results.push("— shipping_coupon_id sudah ada di orders");
  }

  if (!existingCols.includes("shipping_coupon_code")) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders ADD COLUMN shipping_coupon_code TEXT`
    );
    results.push("✓ shipping_coupon_code ditambahkan ke orders");
  } else {
    results.push("— shipping_coupon_code sudah ada di orders");
  }

  return NextResponse.json({ success: true, results });
}
