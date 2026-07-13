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
    manualTransferEnabled: settings.manualTransferEnabled,
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
      manualTransferEnabled: body.manualTransferEnabled,
      ...(body.xenditSecretKey ? { xenditSecretKey: body.xenditSecretKey } : {}),
    },
    create: {
      id: "singleton",
      xenditEnabled: body.xenditEnabled ?? false,
      manualTransferEnabled: body.manualTransferEnabled ?? true,
      xenditSecretKey: body.xenditSecretKey,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ success: true, xenditEnabled: settings.xenditEnabled, manualTransferEnabled: settings.manualTransferEnabled });
}
