import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const popups = await prisma.popupAd.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(popups);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title || body.content === undefined) {
    return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
  }

  const popup = await prisma.popupAd.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      content: body.content,
      useCookies: body.useCookies ?? true,
      cookieDays: body.cookieDays ?? 7,
      delaySeconds: body.delaySeconds ?? 0,
      width: body.width ?? 500,
      height: body.height ?? null,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(popup, { status: 201 });
}
