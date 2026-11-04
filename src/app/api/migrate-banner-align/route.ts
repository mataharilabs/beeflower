import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE banners
    ADD COLUMN IF NOT EXISTS text_align TEXT DEFAULT 'left'
  `);

  return NextResponse.json({ ok: true, message: "text_align column added to banners" });
}
