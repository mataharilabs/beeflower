import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { computeCouponStatus } from "@/lib/coupon";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponStatusButtons } from "@/components/admin/CouponStatusButtons";

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

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coupon, products] = await Promise.all([
    prisma.coupon.findUnique({ where: { id } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!coupon) notFound();

  const status = computeCouponStatus(coupon);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/coupons" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Kupon</h1>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Terpakai</p>
              <p className="text-sm font-semibold text-gray-900">
                {coupon.usedCount}
                {!coupon.isUnlimited && coupon.quota != null ? ` / ${coupon.quota}` : " (Unlimited)"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Nilai Diskon</p>
              <p className="text-sm font-semibold text-gray-900">
                {coupon.discountMode === "FIXED"
                  ? formatPrice(Number(coupon.discountValue.toString()))
                  : `${Number(coupon.discountValue.toString())}%`}
                {" "}
                <span className="text-xs font-normal text-gray-400">
                  ({coupon.discountType === "PRODUCT" ? "Produk" : "Ongkir"})
                </span>
              </p>
            </div>
          </div>
          <CouponStatusButtons
            couponId={coupon.id}
            isPaused={coupon.isPaused}
            isStopped={coupon.isStopped}
          />
        </div>
      </div>

      <CouponForm coupon={coupon} products={products} />
    </div>
  );
}
