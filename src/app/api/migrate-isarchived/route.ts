import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Route sementara untuk menambah kolom isArchived ke tabel products.
// HAPUS file ini setelah migrasi berhasil dijalankan.
export async function POST(req: Request) {
  const secret = process.env.MIGRATE_SECRET;
  if (!secret || req.headers.get("x-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false`;
    return NextResponse.json({ success: true, message: 'Kolom isArchived berhasil ditambahkan' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
