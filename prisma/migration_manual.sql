-- Manual migration script — jalankan di Neon SQL Console
-- Aman dijalankan berkali-kali (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- https://console.neon.tech → pilih project → SQL Editor

-- 1. Enums baru (CouponDiscountType, CouponDiscountMode)
DO $$ BEGIN
  CREATE TYPE "CouponDiscountType" AS ENUM ('SHIPPING', 'PRODUCT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CouponDiscountMode" AS ENUM ('FIXED', 'PERCENTAGE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabel password_reset_tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id"        TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "token"     TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- 3. Tabel coupons
CREATE TABLE IF NOT EXISTS "coupons" (
  "id"                   TEXT NOT NULL,
  "title"                TEXT NOT NULL,
  "description"          TEXT,
  "code"                 TEXT NOT NULL,
  "imageUrl"             TEXT,
  "discountType"         "CouponDiscountType" NOT NULL,
  "discountMode"         "CouponDiscountMode" NOT NULL,
  "discountValue"        DECIMAL(12,2) NOT NULL,
  "isLifetime"           BOOLEAN NOT NULL DEFAULT true,
  "startAt"              TIMESTAMP(3),
  "endAt"                TIMESTAMP(3),
  "isUnlimited"          BOOLEAN NOT NULL DEFAULT true,
  "quota"                INTEGER,
  "usedCount"            INTEGER NOT NULL DEFAULT 0,
  "applicableProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "applicableCities"     TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isPaused"             BOOLEAN NOT NULL DEFAULT false,
  "isStopped"            BOOLEAN NOT NULL DEFAULT false,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");

-- 4. Tabel popup_ads
CREATE TABLE IF NOT EXISTS "popup_ads" (
  "id"           TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "content"      TEXT NOT NULL,
  "useCookies"   BOOLEAN NOT NULL DEFAULT true,
  "cookieDays"   INTEGER NOT NULL DEFAULT 7,
  "delaySeconds" INTEGER NOT NULL DEFAULT 0,
  "width"        INTEGER NOT NULL DEFAULT 500,
  "height"       INTEGER,
  "startAt"      TIMESTAMP(3),
  "endAt"        TIMESTAMP(3),
  "isActive"     BOOLEAN NOT NULL DEFAULT true,
  "viewCount"    INTEGER NOT NULL DEFAULT 0,
  "clickCount"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "popup_ads_pkey" PRIMARY KEY ("id")
);

-- 5. Tabel shipping_settings
CREATE TABLE IF NOT EXISTS "shipping_settings" (
  "id"                   TEXT NOT NULL DEFAULT 'singleton',
  "kiriminajaEnabled"    BOOLEAN NOT NULL DEFAULT false,
  "kiriminajaToken"      TEXT,
  "couriers"             TEXT[] DEFAULT ARRAY['jne','jnt','sicepat','anteraja','pos']::TEXT[],
  "rajaongkirEnabled"    BOOLEAN NOT NULL DEFAULT false,
  "rajaongkirApiKey"     TEXT,
  "rajaongkirCouriers"   TEXT[] DEFAULT ARRAY['jne','jnt','sicepat','anteraja','pos']::TEXT[],
  "flatRateEnabled"      BOOLEAN NOT NULL DEFAULT false,
  "flatRateAmount"       DECIMAL(12,0),
  "flatRateLabel"        TEXT,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- 6. Kolom baru di tabel orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "district"        TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subdistrict"     TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingMethod"  TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingService" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingCourier" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "awbNumber"       TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "awbCourier"      TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId"        TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponCode"      TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponType"      TEXT;

-- FK coupon → orders (skip jika sudah ada)
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Kolom baru di tabel order_items
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "weight" INTEGER;

-- 8. Kolom baru di tabel site_settings (lokasi toko)
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeProvinsiId"    INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeProvinsiName"  TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKabupatenId"   INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKabupatenName" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKecamatanId"   INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKecamatanName" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKelurahanId"   INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeKelurahanName" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoProvinceId"  INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoProvinceName" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoCityId"      INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoCityName"    TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoDistrictId"  INTEGER;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "storeRoDistrictName" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "maintenanceMode"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "facebookPixelId"    TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "headerScripts"      TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footerScripts"      TEXT;
