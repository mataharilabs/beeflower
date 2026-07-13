import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const banner = await prisma.banner.create({ data: body });
  return NextResponse.json(banner, { status: 201 });
}
