import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const store = await prisma.resellerStore.update({
    where: { id },
    data: {
      name: body.name,
      logoUrl: body.logoUrl ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      whatsapp: body.whatsapp ?? null,
      instagram: body.instagram ?? null,
      tiktok: body.tiktok ?? null,
      shopee: body.shopee ?? null,
      tokopedia: body.tokopedia ?? null,
      province: body.province,
      city: body.city,
      isActive: body.isActive,
      order: body.order,
    },
  });
  return NextResponse.json(store);
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
  await prisma.resellerStore.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
