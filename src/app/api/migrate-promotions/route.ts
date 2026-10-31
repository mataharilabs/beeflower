import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DIRECT_URL!);

  await sql`
    DO $$ BEGIN
      CREATE TYPE "PromotionType" AS ENUM (
        'PRODUCT_DISCOUNT', 'ORDER_DISCOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "promotions" (
      "id"                     TEXT NOT NULL,
      "name"                   TEXT NOT NULL,
      "description"            TEXT,
      "type"                   "PromotionType" NOT NULL,
      "isActive"               BOOLEAN NOT NULL DEFAULT TRUE,
      "startAt"                TIMESTAMP(3) NOT NULL,
      "endAt"                  TIMESTAMP(3) NOT NULL,
      "discountMode"           "CouponDiscountMode",
      "discountValue"          DECIMAL(12, 2),
      "minimumPurchase"        DECIMAL(12, 0),
      "applyToAll"             BOOLEAN NOT NULL DEFAULT TRUE,
      "applicableProductIds"   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "applicableProductNames" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "applicableCategoryIds"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "buyProductId"           TEXT,
      "buyProductName"         TEXT,
      "buyQuantity"            INTEGER,
      "getProductId"           TEXT,
      "getProductName"         TEXT,
      "getQuantity"            INTEGER,
      "getDiscountMode"        "CouponDiscountMode",
      "getDiscountValue"       DECIMAL(12, 2),
      "applicableCities"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "usageCount"             INTEGER NOT NULL DEFAULT 0,
      "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
    )
  `;

  return NextResponse.json({ success: true, message: "Tabel promotions berhasil dibuat" });
}
