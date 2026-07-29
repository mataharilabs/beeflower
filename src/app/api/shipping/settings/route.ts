import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const s = await prisma.shippingSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", updatedAt: new Date() },
  }).catch(() => null);
  return NextResponse.json(s ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const s = await prisma.shippingSettings.upsert({
    where: { id: "singleton" },
    update: {
      kiriminajaEnabled: body.kiriminajaEnabled,
      kiriminajaToken: body.kiriminajaToken || null,
      couriers: body.couriers ?? [],
      rajaongkirEnabled: body.rajaongkirEnabled,
      rajaongkirApiKey: body.rajaongkirApiKey || null,
      rajaongkirCouriers: body.rajaongkirCouriers ?? [],
      flatRateEnabled: body.flatRateEnabled,
      flatRateAmount: body.flatRateAmount ? Number(body.flatRateAmount) : null,
      flatRateLabel: body.flatRateLabel || null,
    },
    create: {
      id: "singleton",
      kiriminajaEnabled: body.kiriminajaEnabled ?? false,
      kiriminajaToken: body.kiriminajaToken || null,
      couriers: body.couriers ?? [],
      rajaongkirEnabled: body.rajaongkirEnabled ?? false,
      rajaongkirApiKey: body.rajaongkirApiKey || null,
      rajaongkirCouriers: body.rajaongkirCouriers ?? [],
      flatRateEnabled: body.flatRateEnabled ?? false,
      flatRateAmount: body.flatRateAmount ? Number(body.flatRateAmount) : null,
      flatRateLabel: body.flatRateLabel || null,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(s);
}
