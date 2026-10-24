import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Route sementara untuk menambah kolom SKU ke tabel products.
// HAPUS file ini setelah migrasi berhasil dijalankan.
export async function GET() {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "MIGRATE_SECRET env tidak diset" }, { status: 403 });
  }
  return NextResponse.json({ message: "Gunakan POST dengan header x-secret" }, { status: 405 });
}

export async function POST(req: Request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret || req.headers.get("x-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON products(sku)`;
    return NextResponse.json({ success: true, message: "Kolom SKU berhasil ditambahkan" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
