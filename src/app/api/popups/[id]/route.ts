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
  const popup = await prisma.popupAd.findUnique({ where: { id } });
  if (!popup) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(popup);
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

  const popup = await prisma.popupAd.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.useCookies !== undefined && { useCookies: body.useCookies }),
      ...(body.cookieDays !== undefined && { cookieDays: body.cookieDays }),
      ...(body.delaySeconds !== undefined && { delaySeconds: body.delaySeconds }),
      ...(body.width !== undefined && { width: body.width }),
      ...(body.height !== undefined && { height: body.height }),
      ...(body.startAt !== undefined && { startAt: body.startAt ? new Date(body.startAt) : null }),
      ...(body.endAt !== undefined && { endAt: body.endAt ? new Date(body.endAt) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(popup);
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
  await prisma.popupAd.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
