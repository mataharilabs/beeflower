import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { computeCouponStatus } from "@/lib/coupon";
import { CouponDeleteButton } from "@/components/admin/CouponDeleteButton";
import { Plus } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  RUNNING: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  ENDED: "bg-gray-100 text-gray-500",
  PAUSE: "bg-orange-100 text-orange-700",
  STOPPED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  RUNNING: "Aktif",
  PENDING: "Belum Mulai",
  ENDED: "Berakhir",
  PAUSE: "Dijeda",
  STOPPED: "Dihentikan",
};

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kupon</h1>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Kupon
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">Belum ada kupon. Buat kupon pertama Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Diskon</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Kuota</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => {
                const status = computeCouponStatus(coupon);
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
                    <td className="px-4 py-3 text-gray-700">{coupon.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {discountLabel} <span className="text-xs text-gray-400">({typeLabel})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.isUnlimited
                        ? <span className="text-gray-400">Unlimited</span>
                        : `${coupon.usedCount} / ${coupon.quota}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <CouponDeleteButton couponId={coupon.id} couponCode={coupon.code} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
