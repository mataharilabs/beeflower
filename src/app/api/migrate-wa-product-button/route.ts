import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS wa_button_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS wa_button_text TEXT;
  `);

  return NextResponse.json({ ok: true, message: "wa_button_enabled + wa_button_text columns added to products" });
}
