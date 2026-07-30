import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function NewCouponPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/coupons" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Kupon Baru</h1>
      </div>
      <CouponForm products={products} />
    </div>
  );
}
