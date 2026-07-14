import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentReceivedEmail } from "@/lib/emails";
import { Resend } from "resend";

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

  // Notify admin via email
  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const email = paymentReceivedEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderId: order.id,
    });
    await resend.emails.send({
      from: email.from,
      to: process.env.ADMIN_EMAIL,
      subject: email.subject,
      html: email.html,
    }).catch(console.error);
  }

  return NextResponse.json(proof, { status: 201 });
}
