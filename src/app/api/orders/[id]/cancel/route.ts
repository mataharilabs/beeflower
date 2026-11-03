import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { productId: true, quantity: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Hanya pesanan dengan status Menunggu Pembayaran yang dapat dibatalkan" },
      { status: 400 }
    );
  }

  // Cancel order and restore product stock atomically
  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    ),
  ]);

  return NextResponse.json({ success: true });
}
