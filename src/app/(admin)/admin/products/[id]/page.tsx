import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, settings] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
        <div className="text-xs text-gray-500 text-right space-y-0.5">
          <p>
            Dibuat: {product.createdAt.toLocaleString("id-ID")}
            {product.createdBy && <span className="text-gray-400"> · oleh {product.createdBy}</span>}
          </p>
          <p>
            Diupdate: {product.updatedAt.toLocaleString("id-ID")}
            {product.updatedBy && <span className="text-gray-400"> · oleh {product.updatedBy}</span>}
          </p>
        </div>
      </div>
      <ProductForm product={product} categories={categories} whatsappNumber={settings?.whatsapp ?? null} />
    </div>
  );
}
