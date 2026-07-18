import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import type { HeroProps, Block } from "@/types/pageBlocks";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Produk Kami - Bee & Flower Brand",
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

  const [products, categories, tokoPage] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.page.findUnique({ where: { slug: "toko" } }).catch(() => null),
  ]);

  const blocks: Block[] = ((tokoPage?.craftJson as { blocks?: Block[] })?.blocks) ?? [];
  const heroBlock = blocks.find((b) => b.type === "Hero");
  const heroProps = heroBlock?.props as HeroProps | undefined;

  const headline = heroProps?.headline || "Produk Kami";
  const subheadline = heroProps?.subheadline || "Temukan produk Bee & Flower pilihan terbaik Anda";
  const fallbackBg = { bgType: "color" as const, bgColor: "#3A2D1D", bgImage: "", overlayEnabled: false, overlayColor: "#000000", overlayOpacity: 40 };
  const bgSource = heroProps ?? fallbackBg;
  const bgStyle = getBlockBgStyle(bgSource);
  const showOverlay = shouldShowOverlay(bgSource);
  const overlayStyle = getOverlayStyle(bgSource);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="relative py-12 text-center bg-brand-brown" style={bgStyle}>
        {showOverlay && (
          <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
        )}
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{headline}</h1>
          {subheadline && (
            <p className="text-brand-beige text-sm">{subheadline}</p>
          )}
        </div>
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
