import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS "adminNotifEmail" TEXT;
  `);

  return NextResponse.json({
    ok: true,
    message: "adminNotifEmail column added to site_settings",
  });
}
