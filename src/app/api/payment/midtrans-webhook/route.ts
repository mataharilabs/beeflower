import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Midtrans sends HTTP notifications when transaction status changes.
// Set the notification URL in Midtrans Dashboard → Settings → Configuration:
// https://www.beeflowerbrand.co.id/api/payment/midtrans-webhook
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    order_id,
    status_code,
    gross_amount,
    transaction_status,
    fraud_status,
    signature_key,
    settlement_time,
  } = body;

  if (!order_id) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const settings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
  const serverKey = settings?.midtransServerKey ?? process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    return NextResponse.json({ error: "Midtrans not configured" }, { status: 500 });
  }

  // Verify signature: sha512(order_id + status_code + gross_amount + serverKey)
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (expectedSignature !== signature_key) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // order_id = orderNumber kami
  const order = await prisma.order.findFirst({ where: { orderNumber: order_id } });
  if (!order) {
    // Return 200 so Midtrans stops retrying
    return NextResponse.json({ received: true });
  }

  const isPaid =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status !== "deny");
  const isFailed =
    transaction_status === "expire" ||
    transaction_status === "cancel" ||
    transaction_status === "deny";

  if (isPaid && order.status === "PENDING") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: settlement_time ? new Date(settlement_time) : new Date(),
        updatedBy: "Midtrans",
      },
    });
  } else if (isFailed && order.status === "PENDING") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", updatedBy: "Midtrans" },
    });
  }

  return NextResponse.json({ received: true });
}
