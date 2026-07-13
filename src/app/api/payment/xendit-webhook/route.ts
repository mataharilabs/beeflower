import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Xendit sends webhooks for invoice payment events
export async function POST(req: NextRequest) {
  const webhookToken = req.headers.get("x-callback-token");
  if (webhookToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id: xenditInvoiceId, status, paid_at } = body;

  if (!xenditInvoiceId) {
    return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { xenditInvoiceId },
  });

  if (!order) {
    // Invoice might not be linked yet — return 200 to avoid Xendit retries
    return NextResponse.json({ received: true });
  }

  if (status === "PAID" || status === "SETTLED") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: paid_at ? new Date(paid_at) : new Date(),
      },
    });
  } else if (status === "EXPIRED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ received: true });
}
