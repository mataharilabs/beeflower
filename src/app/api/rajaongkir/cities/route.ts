import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getKey(): Promise<string> {
  if (process.env.RAJAONGKIR_API_KEY) return process.env.RAJAONGKIR_API_KEY;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.rajaongkirApiKey ?? "";
}

export async function GET(req: NextRequest) {
  const provinceId = req.nextUrl.searchParams.get("province_id");
  if (!provinceId) return NextResponse.json({ data: [] });
  try {
    const key = await getKey();
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`, {
      headers: { key },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RajaOngkir ${res.status}`);
    const json = await res.json();
    const list: Record<string, unknown>[] = json.data ?? [];
    const data = list.map((c) => ({
      id: Number(c.city_id ?? c.id),
      name: String(c.city_name ?? c.name ?? ""),
    })).filter((c) => c.id && c.name);
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[rajaongkir/cities]", e);
    return NextResponse.json({ data: [] });
  }
}
