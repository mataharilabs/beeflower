import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getToken(): Promise<string> {
  if (process.env.KIRIMINAJA_TOKEN) return process.env.KIRIMINAJA_TOKEN;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.kiriminajaToken ?? "";
}

export async function GET(req: NextRequest) {
  const kecamatanId = req.nextUrl.searchParams.get("kecamatan_id");
  if (!kecamatanId) return NextResponse.json({ data: [] });
  try {
    const token = await getToken();
    const res = await fetch("https://tdev.kiriminaja.com/api/mitra/kelurahan", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kecamatan_id: Number(kecamatanId) }),
      next: { revalidate: 86400 },
    });
    const json = await res.json();
    const data = (json.data ?? []).map((s: { id: number; name: string }) => ({ id: s.id, name: s.name }));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
