import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_CONFIRMATION' AFTER 'PENDING'`
    );
    return NextResponse.json({ ok: true, message: "OrderStatus PAYMENT_CONFIRMATION added" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
