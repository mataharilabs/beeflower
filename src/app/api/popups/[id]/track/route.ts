import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const type = body.type === "click" ? "click" : "view";

  await prisma.popupAd.update({
    where: { id },
    data: type === "click"
      ? { clickCount: { increment: 1 } }
      : { viewCount: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
