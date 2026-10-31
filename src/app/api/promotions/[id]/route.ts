import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(promotion);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Nama promosi wajib diisi" }, { status: 400 });
  }
  if (body.startAt && body.endAt && new Date(body.endAt) <= new Date(body.startAt)) {
    return NextResponse.json({ error: "Tanggal akhir harus setelah tanggal mulai" }, { status: 400 });
  }

  const promotion = await prisma.promotion.update({ where: { id }, data: body });
  revalidatePath("/admin/promotions");
  return NextResponse.json(promotion);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { isActive } = await req.json();
  const promotion = await prisma.promotion.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/promotions");
  return NextResponse.json(promotion);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/admin/promotions");
  return NextResponse.json({ success: true });
}
