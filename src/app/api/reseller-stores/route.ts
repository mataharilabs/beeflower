import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const stores = await prisma.resellerStore.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const store = await prisma.resellerStore.create({
    data: {
      name: body.name,
      logoUrl: body.logoUrl || null,
      address: body.address || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      instagram: body.instagram || null,
      tiktok: body.tiktok || null,
      shopee: body.shopee || null,
      tokopedia: body.tokopedia || null,
      province: body.province,
      city: body.city,
      isActive: body.isActive ?? true,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(store, { status: 201 });
}
