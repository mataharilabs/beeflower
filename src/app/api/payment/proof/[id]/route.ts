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
  const { action, orderId, reviewNotes } = body;

  if (action !== "verify" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const status = action === "verify" ? "VERIFIED" : "REJECTED";

  await prisma.paymentProof.update({
    where: { id },
    data: { status, reviewNotes: reviewNotes || null, reviewedAt: new Date() },
  });

  if (action === "verify") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
