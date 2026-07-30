import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title || !body.code || !body.discountType || !body.discountMode || body.discountValue == null) {
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
  if (existing) {
    return NextResponse.json({ error: "Kode kupon sudah digunakan" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      code: String(body.code).toUpperCase(),
      imageUrl: body.imageUrl ?? null,
      discountType: body.discountType,
      discountMode: body.discountMode,
      discountValue: body.discountValue,
      isLifetime: body.isLifetime ?? true,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      isUnlimited: body.isUnlimited ?? true,
      quota: body.quota ?? null,
      applicableProductIds: body.applicableProductIds ?? [],
      applicableCities: body.applicableCities ?? [],
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
