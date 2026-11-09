import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ALTER TYPE ... ADD VALUE must run outside a transaction, one statement at a time
  await prisma.$executeRawUnsafe(
    `ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'MIDTRANS';`
  );

  await prisma.$executeRawUnsafe(`
    ALTER TABLE payment_settings
    ADD COLUMN IF NOT EXISTS "midtransEnabled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "midtransServerKey" TEXT,
    ADD COLUMN IF NOT EXISTS "midtransClientKey" TEXT,
    ADD COLUMN IF NOT EXISTS "midtransIsProduction" BOOLEAN NOT NULL DEFAULT false;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS "midtransSnapToken" TEXT,
    ADD COLUMN IF NOT EXISTS "midtransPaymentUrl" TEXT;
  `);

  return NextResponse.json({
    ok: true,
    message:
      "MIDTRANS enum value + payment_settings midtrans columns + orders midtrans columns added",
  });
}
