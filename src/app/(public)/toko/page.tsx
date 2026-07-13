import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Toko Reseller - Bee & Flower Brand",
  description: "Belanja produk Bee & Flower dengan kualitas terjamin. Tersedia berbagai varian aroma.",
};

interface SearchParams {
  category?: string;
  sort?: string;
  search?: string;
}

export default async function TokoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, sort = "createdAt", search } = params;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.categoryId = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="bg-brand-brown py-12 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Toko Reseller</h1>
        <p className="text-brand-beige text-sm">
          Temukan produk Bee & Flower pilihan terbaik Anda
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense>
          <ShopFilters categories={categories} />
        </Suspense>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-brown/50 text-lg">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={{
                ...product,
                price: product.price.toString(),
                comparePrice: product.comparePrice?.toString() ?? null,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
