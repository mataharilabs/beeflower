import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getToken(): Promise<string> {
  if (process.env.KIRIMINAJA_TOKEN) return process.env.KIRIMINAJA_TOKEN;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.kiriminajaToken ?? "";
}

export async function GET() {
  try {
    const token = await getToken();
    const res = await fetch("https://tdev.kiriminaja.com/api/mitra/province", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KiriminAja ${res.status}`);
    const json = await res.json();
    const data = (json.data ?? []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name }));
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[kiriminaja/provinces]", e);
    return NextResponse.json({ data: [] });
  }
}
