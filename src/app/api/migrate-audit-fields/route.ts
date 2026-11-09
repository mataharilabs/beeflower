import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tables = ["products", "orders", "coupons", "promotions", "articles"];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS created_by TEXT,
      ADD COLUMN IF NOT EXISTS updated_by TEXT;
    `);
  }

  return NextResponse.json({
    ok: true,
    message: "created_by + updated_by columns added to: " + tables.join(", "),
  });
}
