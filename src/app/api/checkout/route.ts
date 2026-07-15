import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { orderConfirmationEmail, welcomeEmail } from "@/lib/emails";
import { Resend } from "resend";
import { z } from "zod";
import bcrypt from "bcryptjs";

const CheckoutSchema = z.object({
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
    quantity: z.number().int().min(1),
  })),
});

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const data = parsed.data;

  // Fetch products and validate stock
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems: { productId: string; productName: string; price: number; quantity: number; image: string | null }[] = [];
  let subtotal = 0;

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: `Produk ${item.productId} tidak ditemukan` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok ${product.name} tidak cukup` }, { status: 400 });
    }
    const price = Number(product.price.toString());
    subtotal += price * item.quantity;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price,
      quantity: item.quantity,
      image: product.images[0] ?? null,
    });
  }

  const total = subtotal;
  const orderNumber = generateOrderNumber();

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
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
        subtotal,
        shippingCost: 0,
        discount: 0,
        total,
        items: { create: orderItems },
      },
    });

    // Decrement stock
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  // Auto-create user for guest checkouts
  let isNewUser = false;
  let autoLoginEmail: string | null = null;
  let autoLoginPassword: string | null = null;

  if (!session?.user) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.customerEmail },
      select: { id: true },
    });

    if (existingUser) {
      await prisma.order.update({
        where: { id: order.id },
        data: { userId: existingUser.id },
      });
    } else {
      const plainPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          password: hashedPassword,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { userId: newUser.id },
      });

      isNewUser = true;
      autoLoginEmail = data.customerEmail;
      autoLoginPassword = plainPassword;
    }
  }

  // Send emails
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const confirmEmail = orderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: data.customerName,
      items: orderItems,
      total,
      paymentMethod: data.paymentMethod,
    });
    await resend.emails.send({
      from: confirmEmail.from,
      to: data.customerEmail,
      subject: confirmEmail.subject,
      html: confirmEmail.html,
    }).catch(console.error);

    if (isNewUser && autoLoginPassword) {
      const welcome = welcomeEmail({
        name: data.customerName,
        email: data.customerEmail,
        password: autoLoginPassword,
      });
      await resend.emails.send({
        from: welcome.from,
        to: data.customerEmail,
        subject: welcome.subject,
        html: welcome.html,
      }).catch(console.error);
    }
  }

  // If Xendit, create invoice
  if (data.paymentMethod === "XENDIT") {
    try {
      const xenditSettings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
      const apiKey = xenditSettings?.xenditSecretKey ?? process.env.XENDIT_SECRET_KEY;

      if (apiKey) {
        const response = await fetch("https://api.xendit.co/v2/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
          },
          body: JSON.stringify({
            external_id: order.orderNumber,
            amount: total,
            payer_email: data.customerEmail,
            description: `Pesanan Bee & Flower #${order.orderNumber}`,
            success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/toko/pesanan/${order.id}?status=success`,
            failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/toko/pesanan/${order.id}?status=failed`,
          }),
        });

        if (response.ok) {
          const invoice = await response.json();
          await prisma.order.update({
            where: { id: order.id },
            data: {
              xenditInvoiceId: invoice.id,
              xenditPaymentUrl: invoice.invoice_url,
            },
          });
          return NextResponse.json({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentUrl: invoice.invoice_url,
            isNewUser,
            autoLoginEmail,
            autoLoginPassword,
          }, { status: 201 });
        }
      }
    } catch (err) {
      console.error("Xendit error:", err);
    }
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentUrl: null,
    isNewUser,
    autoLoginEmail,
    autoLoginPassword,
  }, { status: 201 });
}
