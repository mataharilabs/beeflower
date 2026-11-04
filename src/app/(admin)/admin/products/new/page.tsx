import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Produk</h1>
      <ProductForm categories={categories} whatsappNumber={settings?.whatsapp ?? null} />
    </div>
  );
}
