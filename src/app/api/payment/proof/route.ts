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

  // Verify the order exists and is awaiting payment
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "PENDING" && order.status !== "PAYMENT_CONFIRMATION") {
    return NextResponse.json({ error: "Order is not awaiting payment" }, { status: 400 });
  }

  const [proof] = await prisma.$transaction([
    prisma.paymentProof.upsert({
      where: { orderId },
      update: { imageUrl, bankAccountId: bankAccountId || null, notes: notes || null, status: "PENDING" },
      create: { orderId, imageUrl, bankAccountId: bankAccountId || null, notes: notes || null },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_CONFIRMATION" },
    }),
  ]);

  // Notify admin via email (alamat dari settings, fallback env var)
  const siteSettings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" }, select: { adminNotifEmail: true } })
    .catch(() => null);
  const adminEmail = siteSettings?.adminNotifEmail || process.env.ADMIN_EMAIL;

  if (process.env.RESEND_API_KEY && adminEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const email = paymentReceivedEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderId: order.id,
    });
    await resend.emails.send({
      from: email.from,
      to: adminEmail,
      subject: email.subject,
      html: email.html,
    }).catch(console.error);
  }

  return NextResponse.json(proof, { status: 201 });
}
