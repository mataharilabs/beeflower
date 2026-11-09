import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { computeCouponStatus, type CouponStatus } from "@/lib/coupon";
import { CouponDeleteButton } from "@/components/admin/CouponDeleteButton";
import { CouponStatusActions } from "@/components/admin/CouponStatusActions";
import { CouponFilters } from "@/components/admin/CouponFilters";
import { Plus, Globe, Lock } from "lucide-react";

type Tab = CouponStatus | "all";

const STATUS_STYLE: Record<CouponStatus, string> = {
  RUNNING: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  ENDED:   "bg-gray-100 text-gray-500",
  PAUSE:   "bg-orange-100 text-orange-700",
  STOPPED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<CouponStatus, string> = {
  RUNNING: "Aktif",
  PENDING: "Belum Mulai",
  ENDED:   "Berakhir",
  PAUSE:   "Dijeda",
  STOPPED: "Dihentikan",
};

const TAB_ORDER: Tab[] = ["all", "RUNNING", "PENDING", "PAUSE", "STOPPED", "ENDED"];
const TAB_LABELS: Record<Tab, string> = {
  all:     "Semua",
  RUNNING: "Aktif",
  PENDING: "Belum Mulai",
  PAUSE:   "Dijeda",
  STOPPED: "Dihentikan",
  ENDED:   "Berakhir",
};

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string }>;
}) {
  const { tab: rawTab = "all", search = "" } = await searchParams;
  const tab = (TAB_ORDER.includes(rawTab as Tab) ? rawTab : "all") as Tab;

  const allCoupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  const withStatus = allCoupons.map((c) => ({ ...c, computedStatus: computeCouponStatus(c) }));

  // Count per tab
  const countMap: Record<Tab, number> = {
    all: withStatus.length,
    RUNNING: withStatus.filter((c) => c.computedStatus === "RUNNING").length,
    PENDING: withStatus.filter((c) => c.computedStatus === "PENDING").length,
    ENDED:   withStatus.filter((c) => c.computedStatus === "ENDED").length,
    PAUSE:   withStatus.filter((c) => c.computedStatus === "PAUSE").length,
    STOPPED: withStatus.filter((c) => c.computedStatus === "STOPPED").length,
  };

  // Filter by tab then search
  const byTab = tab === "all" ? withStatus : withStatus.filter((c) => c.computedStatus === tab);
  const coupons = search
    ? byTab.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.title.toLowerCase().includes(search.toLowerCase())
      )
    : byTab;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kupon</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {countMap.all} kupon</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Kupon
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col gap-3 mb-5">
        <Suspense>
          <CouponFilters />
        </Suspense>

        <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto">
          {TAB_ORDER.map((t) => (
            <Link
              key={t}
              href={t === "all" ? `/admin/coupons${search ? `?search=${search}` : ""}` : `/admin/coupons?tab=${t}${search ? `&search=${search}` : ""}`}
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
                {countMap[t]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Diskon</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kuota</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Visibilitas</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Dibuat / Diupdate</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  {search ? `Tidak ada kupon yang cocok dengan "${search}"` : "Belum ada kupon."}
                  {!search && (
                    <> <Link href="/admin/coupons/new" className="text-brand-gold hover:underline">Buat yang pertama</Link></>
                  )}
                </td>
              </tr>
            )}
            {coupons.map((coupon) => {
              const discountLabel =
                coupon.discountMode === "FIXED"
                  ? `-${formatPrice(Number(coupon.discountValue.toString()))}`
                  : `-${Number(coupon.discountValue.toString())}%`;
              const typeLabel = coupon.discountType === "PRODUCT" ? "Produk" : "Ongkir";

              return (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-brand-brown">{coupon.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <Link href={`/admin/coupons/${coupon.id}`} className="font-medium hover:text-brand-gold transition-colors">
                      {coupon.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {discountLabel} <span className="text-xs text-gray-400">({typeLabel})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.isUnlimited
                      ? <span className="text-gray-400">Unlimited</span>
                      : `${coupon.usedCount} / ${coupon.quota}`}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.isPublic ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <Globe className="w-3 h-3" /> Publik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        <Lock className="w-3 h-3" /> Privat
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[coupon.computedStatus]}`}>
                      {STATUS_LABEL[coupon.computedStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <p title={new Date(coupon.createdAt).toLocaleString("id-ID")}>
                      {new Date(coupon.createdAt).toLocaleDateString("id-ID")}
                      {coupon.createdBy && <span className="text-gray-400"> · {coupon.createdBy}</span>}
                    </p>
                    <p className="text-gray-400" title={new Date(coupon.updatedAt).toLocaleString("id-ID")}>
                      upd {new Date(coupon.updatedAt).toLocaleDateString("id-ID")}
                      {coupon.updatedBy && <span> · {coupon.updatedBy}</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="text-brand-gold hover:text-brand-brown text-xs font-medium cursor-pointer"
                      >
                        Edit
                      </Link>
                      <CouponStatusActions
                        couponId={coupon.id}
                        couponCode={coupon.code}
                        status={coupon.computedStatus}
                      />
                      <span className="text-gray-200">|</span>
                      <CouponDeleteButton couponId={coupon.id} couponCode={coupon.code} />
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
