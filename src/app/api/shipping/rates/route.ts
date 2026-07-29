import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })),
  kabupatenId: z.number().optional(),
  kelurahanId: z.number().optional(),
  districtId: z.number().optional(),
});

export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  label: string;
  price: number;
  etd: string;
  type: "kiriminaja" | "flat";
}

const COURIER_LABELS: Record<string, string> = {
  jne: "JNE", jnt: "J&T Express", sicepat: "SiCepat", anteraja: "Anteraja", pos: "POS Indonesia",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ options: [] }, { status: 400 });

  const { items, kabupatenId, kelurahanId, districtId } = parsed.data;
  const productIds = items.map((i) => i.productId);

  const [shipping, settings, products] = await Promise.all([
    prisma.shippingSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, weight: true, price: true },
    }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalWeight = 0;
  let itemValue = 0;

  for (const item of items) {
    const p = productMap.get(item.productId);
    if (!p) continue;
    totalWeight += (p.weight ?? 500) * item.quantity;
    itemValue += Number(p.price.toString()) * item.quantity;
  }
  if (totalWeight === 0) totalWeight = 500;

  const options: ShippingOption[] = [];

  if (
    shipping?.kiriminajaEnabled &&
    settings?.storeKabupatenId &&
    settings?.storeKelurahanId
  ) {
    try {
      const token = process.env.KIRIMINAJA_TOKEN ?? shipping.kiriminajaToken ?? "";
      const couriers = shipping.couriers?.length ? shipping.couriers : ["jne", "jnt", "sicepat"];

      const res = await fetch("https://client.kiriminaja.com/api/mitra/v6.1/shipping_price", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          origin: settings.storeKabupatenId,
          subdistrict_origin: settings.storeKelurahanId,
          destination: kabupatenId,
          subdistrict_destination: kelurahanId,
          weight: totalWeight,
          length: 1,
          width: 1,
          height: 1,
          insurance: 0,
          item_value: itemValue,
          courier: couriers,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const couriersData: Record<string, unknown>[] = json.datas ?? json.data ?? [];
        for (const c of couriersData) {
          const courierCode = (c.courier_code as string ?? "").toLowerCase();
          const services: Record<string, unknown>[] = (c.services as Record<string, unknown>[]) ?? [];
          for (const svc of services) {
            const serviceCode = (svc.service_code as string ?? "").toUpperCase();
            const serviceName = svc.service_name as string ?? serviceCode;
            const price = Number(svc.price ?? 0);
            const etd = svc.etd as string ?? "-";
            options.push({
              id: `${courierCode}_${serviceCode.toLowerCase()}`,
              courier: courierCode,
              service: serviceCode,
              label: `${COURIER_LABELS[courierCode] ?? courierCode.toUpperCase()} ${serviceName}`,
              price,
              etd: etd.includes("Hari") ? etd : `${etd} Hari`,
              type: "kiriminaja",
            });
          }
        }
      }
    } catch {
      // API error — return what we have (flat rate may still be added below)
    }
  }

  if (
    shipping?.rajaongkirEnabled &&
    settings?.storeRoDistrictId &&
    districtId
  ) {
    try {
      const key = process.env.RAJAONGKIR_API_KEY ?? shipping.rajaongkirApiKey ?? "";
      const couriers = (shipping.rajaongkirCouriers?.length ? shipping.rajaongkirCouriers : ["jne", "jnt", "sicepat"])
        .join(":");

      const body = new URLSearchParams({
        origin: String(settings.storeRoDistrictId),
        destination: String(districtId),
        weight: String(totalWeight),
        courier: couriers,
        price: "lowest",
      });

      const res = await fetch("https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", key },
        body,
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const results: Record<string, unknown>[] = json.data ?? [];
        for (const r of results) {
          const courierCode = String(r.courier_code ?? r.code ?? "").toLowerCase();
          const courierName = String(r.courier_name ?? r.name ?? courierCode.toUpperCase());
          const serviceCode = String(r.service_code ?? r.service ?? "").toUpperCase();
          const serviceName = String(r.service_name ?? r.description ?? serviceCode);
          const price = Number(r.price ?? r.cost ?? 0);
          const etd = String(r.etd ?? "-");
          if (!price) continue;
          options.push({
            id: `ro_${courierCode}_${serviceCode.toLowerCase()}`,
            courier: courierCode,
            service: serviceCode,
            label: `${courierName} ${serviceName}`,
            price,
            etd: etd.includes("Hari") ? etd : `${etd} Hari`,
            type: "kiriminaja",
          });
        }
      }
    } catch {
      // API error — continue
    }
  }

  if (shipping?.flatRateEnabled && shipping.flatRateAmount) {
    options.push({
      id: "flat",
      courier: "flat",
      service: "FLAT",
      label: shipping.flatRateLabel ?? "Flat Rate",
      price: Number(shipping.flatRateAmount.toString()),
      etd: "-",
      type: "flat",
    });
  }

  return NextResponse.json({ options });
}
