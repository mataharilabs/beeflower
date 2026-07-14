import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const banner = await prisma.banner.update({ where: { id }, data: body });
  revalidatePath("/");
  return NextResponse.json(banner);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
