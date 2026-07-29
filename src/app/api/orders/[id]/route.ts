import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { orderStatusEmail } from "@/lib/emails";

const NOTIFY_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, paymentProof: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only admin or the order owner can access
  if (session?.user?.role !== "ADMIN" && order.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(order);
}

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
  const order = await prisma.order.update({
    where: { id },
    data: {
      status: body.status,
      ...(body.status === "PAID" ? { paidAt: new Date() } : {}),
    },
  });

  if (process.env.RESEND_API_KEY && NOTIFY_STATUSES.includes(body.status)) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const brandSettings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { logoUrl: true, logoWidth: true },
    }).catch(() => null);
    const email = orderStatusEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: body.status,
      logoUrl: brandSettings?.logoUrl,
      logoWidth: brandSettings?.logoWidth,
    });
    resend.emails.send({
      from: email.from,
      to: order.customerEmail,
      subject: email.subject,
      html: email.html,
    }).catch(console.error);
  }

  return NextResponse.json(order);
}
