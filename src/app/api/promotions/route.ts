import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const promotions = await prisma.promotion.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Nama promosi wajib diisi" }, { status: 400 });
  }
  if (!body.startAt || !body.endAt) {
    return NextResponse.json({ error: "Periode waktu wajib diisi" }, { status: 400 });
  }
  if (new Date(body.endAt) <= new Date(body.startAt)) {
    return NextResponse.json({ error: "Tanggal akhir harus setelah tanggal mulai" }, { status: 400 });
  }

  const promotion = await prisma.promotion.create({ data: body });
  revalidatePath("/admin/promotions");
  return NextResponse.json(promotion, { status: 201 });
}
