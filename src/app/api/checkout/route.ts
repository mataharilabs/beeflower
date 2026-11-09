import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { orderConfirmationEmail, welcomeEmail } from "@/lib/emails";
import { isCouponUsable, calculateCouponDiscount } from "@/lib/coupon";
import { getProductDiscount, getOrderDiscountPromos, getFreeShippingPromos } from "@/lib/promotions";
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
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["XENDIT", "MIDTRANS", "MANUAL_TRANSFER", "QRIS"]),
  shippingCost: z.number().min(0).default(0),
  shippingMethod: z.string().optional(),
  shippingService: z.string().optional(),
  shippingCourier: z.string().optional(),
  couponCode: z.string().optional(),
  shippingCouponCode: z.string().optional(),
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
  const orderItems: { productId: string; productName: string; price: number; quantity: number; image: string | null; weight: number | null }[] = [];
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
      weight: product.weight ?? null,
    });
  }

  const shippingCost = data.shippingCost ?? 0;

  // ── Promotions ─────────────────────────────────────────────────────────────
  const now = new Date();
  const activePromos = await prisma.promotion.findMany({
    where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
  }).catch(() => []);

  const promotions = activePromos.map((p) => ({
    ...p,
    type: p.type as "PRODUCT_DISCOUNT" | "ORDER_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING",
    discountMode: p.discountMode as "FIXED" | "PERCENTAGE" | null,
    discountValue: p.discountValue ? Number(p.discountValue.toString()) : null,
    minimumPurchase: p.minimumPurchase ? Number(p.minimumPurchase.toString()) : null,
    getDiscountMode: p.getDiscountMode as "FIXED" | "PERCENTAGE" | null,
    getDiscountValue: p.getDiscountValue ? Number(p.getDiscountValue.toString()) : null,
    startAt: p.startAt.toISOString(),
    endAt: p.endAt.toISOString(),
  }));

  // Apply PRODUCT_DISCOUNT: reduce per-item prices
  let productPromoDiscountTotal = 0;
  const adjustedOrderItems = orderItems.map((item) => {
    const productObj = productMap.get(item.productId);
    const promoD = getProductDiscount(
      item.productId,
      productObj?.categoryId ?? null,
      item.price,
      promotions
    );
    if (promoD) {
      const discountedPrice = Math.round(promoD.discountedPrice);
      const discountPerUnit = item.price - discountedPrice;
      productPromoDiscountTotal += discountPerUnit * item.quantity;
      return { ...item, price: discountedPrice };
    }
    return item;
  });

  // Apply BUY_X_GET_Y: add free/discounted item to order
  let buyXGetYDiscount = 0;
  for (const promo of promotions) {
    if (promo.type !== "BUY_X_GET_Y") continue;
    if (!promo.buyProductId || !promo.buyQuantity || !promo.getProductId) continue;
    const buyItem = adjustedOrderItems.find((i) => i.productId === promo.buyProductId);
    if (!buyItem || buyItem.quantity < promo.buyQuantity) continue;

    // Fetch the get product
    const getProduct = await prisma.product.findUnique({
      where: { id: promo.getProductId, isActive: true },
    }).catch(() => null);
    if (!getProduct || getProduct.stock < (promo.getQuantity ?? 1)) continue;

    const originalGetPrice = Number(getProduct.price.toString());
    let getPrice = 0;
    if (promo.getDiscountMode === "PERCENTAGE" && promo.getDiscountValue != null) {
      getPrice = Math.max(0, Math.round(originalGetPrice * (1 - promo.getDiscountValue / 100)));
    } else if (promo.getDiscountMode === "FIXED" && promo.getDiscountValue != null) {
      getPrice = Math.max(0, originalGetPrice - promo.getDiscountValue);
    }
    const getQty = promo.getQuantity ?? 1;
    buyXGetYDiscount += (originalGetPrice - getPrice) * getQty;

    adjustedOrderItems.push({
      productId: getProduct.id,
      productName: `${getProduct.name} [Bonus: ${promo.name}]`,
      price: getPrice,
      quantity: getQty,
      image: getProduct.images[0] ?? null,
      weight: getProduct.weight ?? null,
    });
  }

  // Recompute subtotal using adjusted prices
  let adjustedSubtotal = 0;
  for (const item of adjustedOrderItems) {
    adjustedSubtotal += item.price * item.quantity;
  }

  // Apply ORDER_DISCOUNT
  const { totalDiscount: orderPromoDiscount } = getOrderDiscountPromos(adjustedSubtotal, promotions);

  // Apply FREE_SHIPPING
  const freeShipPromos = getFreeShippingPromos(data.city, adjustedSubtotal, promotions);
  const effectiveShippingCost = freeShipPromos.length > 0 ? 0 : shippingCost;

  const totalPromoDiscount = productPromoDiscountTotal + buyXGetYDiscount + Math.round(orderPromoDiscount);

  // Coupon validation helper
  const validateCoupon = async (code: string, expectedType?: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !isCouponUsable(coupon)) return null;
    if (expectedType && coupon.discountType !== expectedType) return null;
    const productIds = orderItems.map((i) => i.productId);
    const productConditionOk =
      coupon.applicableProductIds.length === 0 ||
      productIds.every((pid) => coupon.applicableProductIds.includes(pid));
    const cityConditionOk =
      coupon.applicableCities.length === 0 ||
      coupon.applicableCities.some((c) => c.toLowerCase() === data.city.toLowerCase());
    if (!productConditionOk || !cityConditionOk) return null;
    return coupon;
  };

  // Product coupon
  let couponDiscount = 0;
  let couponId: string | null = null;
  let couponType: string | null = null;
  let appliedCouponCode: string | null = null;

  if (data.couponCode) {
    const coupon = await validateCoupon(data.couponCode);
    if (coupon) {
      couponDiscount = calculateCouponDiscount(
        coupon.discountMode,
        coupon.discountType,
        Number(coupon.discountValue.toString()),
        subtotal,
        shippingCost,
      );
      couponId = coupon.id;
      couponType = coupon.discountType;
      appliedCouponCode = coupon.code;
    }
  }

  // Shipping coupon (separate, additive)
  let shippingCouponDiscount = 0;
  let shippingCouponId: string | null = null;
  let appliedShippingCouponCode: string | null = null;

  if (data.shippingCouponCode) {
    const coupon = await validateCoupon(data.shippingCouponCode, "SHIPPING");
    if (coupon) {
      shippingCouponDiscount = calculateCouponDiscount(
        coupon.discountMode,
        coupon.discountType,
        Number(coupon.discountValue.toString()),
        subtotal,
        shippingCost,
      );
      shippingCouponId = coupon.id;
      appliedShippingCouponCode = coupon.code;
    }
  }

  const totalCouponDiscount = couponDiscount + shippingCouponDiscount;
  const total = Math.max(0, adjustedSubtotal + effectiveShippingCost - totalCouponDiscount);
  const totalDiscount = totalCouponDiscount + totalPromoDiscount;
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
        district: data.district,
        subdistrict: data.subdistrict,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        subtotal: adjustedSubtotal,
        shippingCost: effectiveShippingCost,
        shippingMethod: data.shippingMethod,
        shippingService: data.shippingService,
        shippingCourier: data.shippingCourier,
        discount: totalDiscount,
        couponId,
        couponCode: appliedCouponCode,
        couponType,
        shippingCouponId,
        shippingCouponCode: appliedShippingCouponCode,
        total,
        createdBy: session?.user?.name ?? data.customerName,
        items: { create: adjustedOrderItems },
      },
    });

    // Decrement stock for ordered items (including BUY_X_GET_Y bonus)
    const stockDecrements = new Map<string, number>();
    for (const item of adjustedOrderItems) {
      stockDecrements.set(item.productId, (stockDecrements.get(item.productId) ?? 0) + item.quantity);
    }
    for (const [productId, qty] of stockDecrements) {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: qty } },
      });
    }

    return created;
  });

  // Increment coupon usage counts
  if (couponId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    }).catch(() => {});
  }
  if (shippingCouponId) {
    await prisma.coupon.update({
      where: { id: shippingCouponId },
      data: { usedCount: { increment: 1 } },
    }).catch(() => {});
  }

  // Auto-create user for guest checkouts
  let isNewUser = false;
  let autoLoginEmail: string | null = null;
  let autoLoginPassword: string | null = null;

  if (!session?.user) {
    try {
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
    } catch (err) {
      // User creation failure should not block the order from succeeding
      console.error("[checkout] user auto-create failed:", err);
    }
  }

  // Send emails
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const brandSettings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { logoUrl: true, logoWidth: true },
    }).catch(() => null);
    const logoUrl = brandSettings?.logoUrl ?? null;
    const logoWidth = brandSettings?.logoWidth ?? null;

    let bankAccounts: { bankName: string; accountHolder: string; accountNumber: string; logoUrl: string | null }[] = [];
    let qrisImageUrl: string | null = null;

    if (data.paymentMethod === "MANUAL_TRANSFER") {
      bankAccounts = await prisma.bankAccount.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { bankName: true, accountHolder: true, accountNumber: true, logoUrl: true },
      });
    } else if (data.paymentMethod === "QRIS") {
      const paySettings = await prisma.paymentSettings.findUnique({
        where: { id: "singleton" },
        select: { qrisImageUrl: true },
      }).catch(() => null);
      qrisImageUrl = paySettings?.qrisImageUrl ?? null;
    }

    const confirmEmail = orderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: data.customerName,
      items: adjustedOrderItems,
      total,
      paymentMethod: data.paymentMethod,
      logoUrl,
      logoWidth,
      shippingCost: effectiveShippingCost,
      shippingService: data.shippingService,
      orderId: order.id,
      bankAccounts,
      qrisImageUrl,
      couponCode: appliedCouponCode ?? undefined,
      couponDiscount: totalDiscount > 0 ? totalDiscount : undefined,
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
        logoUrl,
        logoWidth,
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

  // If Midtrans, create Snap transaction
  if (data.paymentMethod === "MIDTRANS") {
    try {
      const paySettings = await prisma.paymentSettings.findUnique({ where: { id: "singleton" } });
      const serverKey = paySettings?.midtransServerKey ?? process.env.MIDTRANS_SERVER_KEY;
      const isProduction = paySettings?.midtransIsProduction ?? false;

      if (serverKey) {
        const snapBaseUrl = isProduction
          ? "https://app.midtrans.com/snap/v1/transactions"
          : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        const response = await fetch(snapBaseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: order.orderNumber,
              gross_amount: Math.round(total),
            },
            customer_details: {
              first_name: data.customerName,
              email: data.customerEmail,
              phone: data.customerPhone,
              shipping_address: {
                first_name: data.customerName,
                address: data.address,
                city: data.city,
                postal_code: data.postalCode,
                country_code: "IDN",
              },
            },
            callbacks: {
              finish: `${process.env.NEXT_PUBLIC_APP_URL}/toko/pesanan/${order.id}?status=success`,
            },
          }),
        });

        if (response.ok) {
          const snap = await response.json();
          await prisma.order.update({
            where: { id: order.id },
            data: {
              midtransSnapToken: snap.token,
              midtransPaymentUrl: snap.redirect_url,
            },
          });
          return NextResponse.json({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentUrl: snap.redirect_url,
            isNewUser,
            autoLoginEmail,
            autoLoginPassword,
          }, { status: 201 });
        } else {
          console.error("Midtrans snap error:", await response.text());
        }
      }
    } catch (err) {
      console.error("Midtrans error:", err);
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
