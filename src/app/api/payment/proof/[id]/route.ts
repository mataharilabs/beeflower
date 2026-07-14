import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { paymentVerifiedEmail } from "@/lib/emails";
import { Resend } from "resend";

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

  let customerEmail: string | null = null;
  let customerName = "";
  let orderNumber = "";

  if (action === "verify") {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: new Date() },
    });
    customerEmail = updated.customerEmail;
    customerName = updated.customerName;
    orderNumber = updated.orderNumber;
  } else {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      customerEmail = order.customerEmail;
      customerName = order.customerName;
      orderNumber = order.orderNumber;
    }
  }

  // Notify customer via email
  if (process.env.RESEND_API_KEY && customerEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const email = paymentVerifiedEmail({
      orderNumber,
      customerName,
      action: action as "verify" | "reject",
      reviewNotes,
    });
    await resend.emails.send({
      from: email.from,
      to: customerEmail,
      subject: email.subject,
      html: email.html,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
