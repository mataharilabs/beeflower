import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getToken(): Promise<string> {
  if (process.env.KIRIMINAJA_TOKEN) return process.env.KIRIMINAJA_TOKEN;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.kiriminajaToken ?? "";
}

export async function GET(req: NextRequest) {
  const provinsiId = req.nextUrl.searchParams.get("provinsi_id");
  if (!provinsiId) return NextResponse.json({ data: [] });
  try {
    const token = await getToken();
    const res = await fetch("https://client.kiriminaja.com/api/mitra/city", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ provinsi_id: Number(provinsiId) }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KiriminAja ${res.status}`);
    const json = await res.json();
    const list = json.datas ?? json.data ?? [];
    const data = (Array.isArray(list) ? list : []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }));
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[kiriminaja/cities]", e);
    return NextResponse.json({ data: [] });
  }
}
