import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_CONFIRMATION';
  `);

  return NextResponse.json({ ok: true, message: "PAYMENT_CONFIRMATION added to OrderStatus enum" });
}
