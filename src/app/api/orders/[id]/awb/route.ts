import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Resend } from "resend";
import { awbUpdateEmail } from "@/lib/emails";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { awbNumber, awbCourier } = body;

  if (!awbNumber?.trim() || !awbCourier?.trim()) {
    return NextResponse.json({ error: "No. Resi dan Kurir wajib diisi" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      awbNumber: awbNumber.trim(),
      awbCourier: awbCourier.trim(),
    },
  });

  // Send email notification to customer
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const brandSettings = await prisma.siteSettings
        .findUnique({ where: { id: "singleton" }, select: { logoUrl: true, logoWidth: true } })
        .catch(() => null);

      const email = awbUpdateEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        awbNumber: awbNumber.trim(),
        awbCourier: awbCourier.trim(),
        orderId: id,
        logoUrl: brandSettings?.logoUrl,
        logoWidth: brandSettings?.logoWidth,
      });

      await resend.emails.send({
        from: email.from,
        to: order.customerEmail,
        subject: email.subject,
        html: email.html,
      });
    } catch (e) {
      console.error("[awb email]", e);
    }
  }

  return NextResponse.json(order);
}
