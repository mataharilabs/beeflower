import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Test 1: raw SQL to check is_public column
  try {
    await prisma.$executeRawUnsafe(`SELECT is_public FROM coupons LIMIT 0`);
    results.raw_is_public = "EXISTS";
  } catch (e: unknown) {
    results.raw_is_public = `MISSING: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 2: raw SQL to check shipping_coupon_id on orders
  try {
    await prisma.$executeRawUnsafe(`SELECT shipping_coupon_id FROM orders LIMIT 0`);
    results.raw_shipping_coupon_id = "EXISTS";
  } catch (e: unknown) {
    results.raw_shipping_coupon_id = `MISSING: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 3: try prisma findFirst with only stable columns
  try {
    const c = await prisma.coupon.findFirst({ select: { id: true, code: true } });
    results.prisma_basic = c ? `OK (id=${c.id})` : "OK (no rows)";
  } catch (e: unknown) {
    results.prisma_basic = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test 4: try prisma findFirst with isPublic
  try {
    const c = await prisma.coupon.findFirst({ select: { id: true, isPublic: true } });
    results.prisma_isPublic = c ? `OK (isPublic=${c.isPublic})` : "OK (no rows)";
  } catch (e: unknown) {
    results.prisma_isPublic = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(results);
}
