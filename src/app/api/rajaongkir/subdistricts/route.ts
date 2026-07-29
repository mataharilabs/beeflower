import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getKey(): Promise<string> {
  if (process.env.RAJAONGKIR_API_KEY) return process.env.RAJAONGKIR_API_KEY;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.rajaongkirApiKey ?? "";
}

export async function GET(req: NextRequest) {
  const districtId = req.nextUrl.searchParams.get("district_id");
  if (!districtId) return NextResponse.json({ data: [] });
  try {
    const key = await getKey();
    const res = await fetch(`https://rajaongkir.komerce.id/api/v1/destination/sub-district/${districtId}`, {
      headers: { key },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RajaOngkir ${res.status}`);
    const json = await res.json();
    const list: Record<string, unknown>[] = json.data ?? [];
    const data = list.map((s) => ({
      id: Number(s.subdistrict_id ?? s.sub_district_id ?? s.id),
      name: String(s.subdistrict_name ?? s.sub_district_name ?? s.name ?? ""),
    })).filter((s) => s.id && s.name);
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[rajaongkir/subdistricts]", e);
    return NextResponse.json({ data: [] });
  }
}
