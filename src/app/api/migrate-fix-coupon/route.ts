import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false`
    );
    results.push("coupons.is_public: OK");
  } catch (e: unknown) {
    results.push(`coupons.is_public: ERROR - ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_coupon_id TEXT`
    );
    results.push("orders.shipping_coupon_id: OK");
  } catch (e: unknown) {
    results.push(`orders.shipping_coupon_id: ERROR - ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_coupon_code TEXT`
    );
    results.push("orders.shipping_coupon_code: OK");
  } catch (e: unknown) {
    results.push(`orders.shipping_coupon_code: ERROR - ${e instanceof Error ? e.message : String(e)}`);
  }

  return NextResponse.json({ success: true, results });
}
