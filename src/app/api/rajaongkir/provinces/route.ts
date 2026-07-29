import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getKey(): Promise<string> {
  if (process.env.RAJAONGKIR_API_KEY) return process.env.RAJAONGKIR_API_KEY;
  const s = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return s?.rajaongkirApiKey ?? "";
}

export async function GET() {
  try {
    const key = await getKey();
    const res = await fetch("https://rajaongkir.komerce.id/api/v1/destination/province", {
      headers: { key },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RajaOngkir ${res.status}`);
    const json = await res.json();
    const list: Record<string, unknown>[] = json.data ?? [];
    const data = list.map((p) => ({
      id: Number(p.province_id ?? p.id),
      name: String(p.province ?? p.name ?? ""),
    })).filter((p) => p.id && p.name);
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[rajaongkir/provinces]", e);
    return NextResponse.json({ data: [] });
  }
}
