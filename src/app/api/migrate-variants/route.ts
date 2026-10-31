import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DIRECT_URL!);

  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS "variantsEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "variantWeightPerVariant" BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "variantGroups" JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS "variants" JSONB NOT NULL DEFAULT '[]'::jsonb
  `;

  return NextResponse.json({ success: true, message: "Kolom variant berhasil ditambahkan" });
}
