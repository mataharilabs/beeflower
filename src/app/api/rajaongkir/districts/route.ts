import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getKey(): Promise<string> {
  if (process.env.RAJAONGKIR_API_KEY) return process.env.RAJAONGKIR_API_KEY;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.rajaongkirApiKey ?? "";
}

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get("city_id");
  if (!cityId) return NextResponse.json({ data: [] });
  try {
    const key = await getKey();
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/district/${cityId}`, {
      headers: { key },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RajaOngkir ${res.status}`);
    const json = await res.json();
    const list: Record<string, unknown>[] = json.data ?? [];
    const data = list.map((d) => ({
      id: Number(d.district_id ?? d.id),
      name: String(d.district_name ?? d.name ?? ""),
    })).filter((d) => d.id && d.name);
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[rajaongkir/districts]", e);
    return NextResponse.json({ data: [] });
  }
}
