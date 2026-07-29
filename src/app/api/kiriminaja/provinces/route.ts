import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 86400 },
    });
    const json = await res.json();
    const data = (json.data ?? []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name }));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
