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
    console.log("[kiriminaja/provinces] token present:", !!token, "len:", token.length);
    const res = await fetch("https://tdev.kiriminaja.com/api/mitra/province", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    console.log("[kiriminaja/provinces] status:", res.status);
    const json = await res.json();
    console.log("[kiriminaja/provinces] keys:", Object.keys(json), "data count:", Array.isArray(json.data) ? json.data.length : json.data);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
    const data = (Array.isArray(json.data) ? json.data : []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name }));
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[kiriminaja/provinces] error:", e);
    return NextResponse.json({ data: [] });
  }
}
