import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { PromotionToggle } from "@/components/admin/PromotionToggle";
import { DeletePromotionButton } from "@/components/admin/DeletePromotionButton";

type PromotionType = "PRODUCT_DISCOUNT" | "ORDER_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
type Tab = PromotionType | "all";

const TYPE_LABEL: Record<PromotionType, { label: string; color: string }> = {
  PRODUCT_DISCOUNT: { label: "Diskon Produk",  color: "bg-amber-50 text-amber-700" },
  ORDER_DISCOUNT:   { label: "Diskon Pesanan", color: "bg-blue-50 text-blue-700" },
  BUY_X_GET_Y:      { label: "Beli X Dapat Y", color: "bg-green-50 text-green-700" },
  FREE_SHIPPING:    { label: "Gratis Ongkir",  color: "bg-cyan-50 text-cyan-700" },
};

const TAB_LABELS: Record<Tab, string> = {
  all:              "Semua",
  PRODUCT_DISCOUNT: "Diskon Produk",
  ORDER_DISCOUNT:   "Diskon Pesanan",
  BUY_X_GET_Y:      "Beli X Dapat Y",
  FREE_SHIPPING:    "Gratis Ongkir",
};

function getStatus(p: { isActive: boolean; startAt: Date; endAt: Date }) {
  const now = new Date();
  if (!p.isActive)         return { label: "Nonaktif",    color: "bg-gray-100 text-gray-500" };
  if (now < p.startAt)     return { label: "Belum Aktif", color: "bg-yellow-50 text-yellow-700" };
  if (now > p.endAt)       return { label: "Kedaluwarsa", color: "bg-red-50 text-red-700" };
  return                          { label: "Aktif",        color: "bg-green-50 text-green-700" };
}

function getSummary(p: {
  type: string;
  discountMode: string | null;
  discountValue: { toString(): string } | null;
  minimumPurchase: { toString(): string } | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  getDiscountMode: string | null;
  applicableCities: string[];
}): string {
  if (p.type === "PRODUCT_DISCOUNT" || p.type === "ORDER_DISCOUNT") {
    if (!p.discountValue) return "—";
    const val = p.discountMode === "PERCENTAGE"
      ? `${Number(p.discountValue.toString())}%`
      : formatPrice(Number(p.discountValue.toString()));
    const min = p.minimumPurchase
      ? ` · Min. ${formatPrice(Number(p.minimumPurchase.toString()))}`
      : "";
    return `Diskon ${val}${min}`;
  }
  if (p.type === "BUY_X_GET_Y") {
    const getDisc = p.getDiscountMode ? `Diskon` : "Gratis";
    return `Beli ${p.buyQuantity ?? "?"} → ${getDisc} ${p.getQuantity ?? "?"} pcs`;
  }
  if (p.type === "FREE_SHIPPING") {
    const min = p.minimumPurchase
      ? `Min. ${formatPrice(Number(p.minimumPurchase.toString()))}`
      : "Tanpa min. belanja";
    const cities = p.applicableCities.length
      ? ` · ${p.applicableCities.length} kota`
      : " · Semua kota";
    return `${min}${cities}`;
  }
  return "—";
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab = "all" } = await searchParams;
  const tab = (["all", "PRODUCT_DISCOUNT", "ORDER_DISCOUNT", "BUY_X_GET_Y", "FREE_SHIPPING"].includes(rawTab)
    ? rawTab
    : "all") as Tab;

  const typeFilter = tab === "all" ? undefined : tab;

  const [promotions, counts] = await Promise.all([
    prisma.promotion.findMany({
      where: typeFilter ? { type: typeFilter } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    Promise.all(
      (["all", "PRODUCT_DISCOUNT", "ORDER_DISCOUNT", "BUY_X_GET_Y", "FREE_SHIPPING"] as Tab[]).map(async (t) => ({
        tab: t,
        count: await prisma.promotion.count({ where: t === "all" ? undefined : { type: t } }),
      }))
    ),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.tab, c.count]));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promosi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {countMap.all ?? 0} promosi</p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Promosi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-100 overflow-x-auto">
        {(["all", "PRODUCT_DISCOUNT", "ORDER_DISCOUNT", "BUY_X_GET_Y", "FREE_SHIPPING"] as Tab[]).map((t) => (
          <Link
            key={t}
            href={t === "all" ? "/admin/promotions" : `/admin/promotions?tab=${t}`}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === t
                ? "border-brand-gold text-brand-gold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[t]}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
              tab === t ? "bg-brand-gold/10 text-brand-gold" : "bg-gray-100 text-gray-500"
            }`}>
              {countMap[t] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Tipe</th>
              <th className="text-left px-4 py-3 font-medium">Nama</th>
              <th className="text-left px-4 py-3 font-medium">Ringkasan</th>
              <th className="text-left px-4 py-3 font-medium">Periode</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Aktif</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {promotions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Belum ada promosi. <Link href="/admin/promotions/new" className="text-brand-gold hover:underline">Buat yang pertama</Link>
                </td>
              </tr>
            )}
            {promotions.map((p) => {
              const typeMeta = TYPE_LABEL[p.type as PromotionType];
              const status = getStatus(p);
              const summary = getSummary(p);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeMeta?.color ?? "bg-gray-50 text-gray-700"}`}>
                      {typeMeta?.label ?? p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/promotions/${p.id}`} className="font-medium text-gray-900 hover:text-brand-gold transition-colors">
                      {p.name}
                    </Link>
                    {p.description && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{summary}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-600">
                      {new Date(p.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs text-gray-400">
                      s/d {new Date(p.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PromotionToggle id={p.id} isActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/promotions/${p.id}`} className="text-xs font-medium text-brand-gold hover:text-brand-brown transition-colors cursor-pointer">
                        Edit
                      </Link>
                      <span className="text-gray-200">|</span>
                      <DeletePromotionButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
