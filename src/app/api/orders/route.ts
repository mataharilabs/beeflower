import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(["XENDIT", "MANUAL_TRANSFER"]),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    image: z.string().optional(),
  })),
  subtotal: z.number(),
  shippingCost: z.number().default(0),
  discount: z.number().default(0),
  total: z.number(),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true } } },
    take: 100,
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session?.user?.id ?? null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      discount: data.discount,
      total: data.total,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
