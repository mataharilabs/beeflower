import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const settings = await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", updatedAt: new Date() },
  });
  // Never expose secret key publicly
  return NextResponse.json({
    xenditEnabled: settings.xenditEnabled,
    midtransEnabled: settings.midtransEnabled,
    manualTransferEnabled: settings.manualTransferEnabled,
    qrisEnabled: settings.qrisEnabled,
    qrisImageUrl: settings.qrisImageUrl,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const settings = await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: {
      xenditEnabled: body.xenditEnabled,
      midtransEnabled: body.midtransEnabled ?? false,
      midtransIsProduction: body.midtransIsProduction ?? false,
      manualTransferEnabled: body.manualTransferEnabled,
      qrisEnabled: body.qrisEnabled,
      qrisImageUrl: body.qrisImageUrl ?? null,
      ...(body.xenditSecretKey ? { xenditSecretKey: body.xenditSecretKey } : {}),
      ...(body.midtransServerKey ? { midtransServerKey: body.midtransServerKey } : {}),
      ...(body.midtransClientKey ? { midtransClientKey: body.midtransClientKey } : {}),
    },
    create: {
      id: "singleton",
      xenditEnabled: body.xenditEnabled ?? false,
      midtransEnabled: body.midtransEnabled ?? false,
      midtransIsProduction: body.midtransIsProduction ?? false,
      manualTransferEnabled: body.manualTransferEnabled ?? true,
      qrisEnabled: body.qrisEnabled ?? false,
      qrisImageUrl: body.qrisImageUrl ?? null,
      xenditSecretKey: body.xenditSecretKey,
      midtransServerKey: body.midtransServerKey,
      midtransClientKey: body.midtransClientKey,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({
    success: true,
    xenditEnabled: settings.xenditEnabled,
    midtransEnabled: settings.midtransEnabled,
    manualTransferEnabled: settings.manualTransferEnabled,
  });
}
