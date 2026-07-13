import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, imageUrl, bankAccountId, notes } = body;

  if (!orderId || !imageUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the order exists and is PENDING
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
  }

  const proof = await prisma.paymentProof.upsert({
    where: { orderId },
    update: { imageUrl, bankAccountId: bankAccountId || null, notes: notes || null, status: "PENDING" },
    create: { orderId, imageUrl, bankAccountId: bankAccountId || null, notes: notes || null },
  });

  return NextResponse.json(proof, { status: 201 });
}
