import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coupon);
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
  const body = await req.json();

  if (body.code) {
    const existing = await prisma.coupon.findFirst({
      where: { code: String(body.code).toUpperCase(), NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Kode kupon sudah digunakan" }, { status: 400 });
    }
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.code !== undefined && { code: String(body.code).toUpperCase() }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.discountType !== undefined && { discountType: body.discountType }),
      ...(body.discountMode !== undefined && { discountMode: body.discountMode }),
      ...(body.discountValue !== undefined && { discountValue: body.discountValue }),
      ...(body.isLifetime !== undefined && { isLifetime: body.isLifetime }),
      ...(body.startAt !== undefined && { startAt: body.startAt ? new Date(body.startAt) : null }),
      ...(body.endAt !== undefined && { endAt: body.endAt ? new Date(body.endAt) : null }),
      ...(body.isUnlimited !== undefined && { isUnlimited: body.isUnlimited }),
      ...(body.quota !== undefined && { quota: body.quota }),
      ...(body.applicableProductIds !== undefined && { applicableProductIds: body.applicableProductIds }),
      ...(body.applicableCities !== undefined && { applicableCities: body.applicableCities }),
      ...(body.isPaused !== undefined && { isPaused: body.isPaused }),
      ...(body.isStopped !== undefined && { isStopped: body.isStopped }),
    },
  });

  return NextResponse.json(coupon);
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
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
