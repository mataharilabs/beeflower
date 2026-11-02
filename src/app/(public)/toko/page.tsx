import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopSidebar } from "@/components/shop/ShopSidebar";
import type { ActivePromotion } from "@/lib/promotions";
import type { HeroProps, Block } from "@/types/pageBlocks";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Produk Kami - Bee & Flower Brand",
  description: "Belanja produk Bee & Flower dengan kualitas terjamin. Tersedia berbagai varian aroma.",
};

interface SearchParams {
  category?: string;
  sort?: string;
  search?: string;
  tags?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function TokoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, sort = "createdAt", search, tags, minPrice, maxPrice } = params;

  const selectedTags = tags ? tags.split(",").filter(Boolean) : [];

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.categoryId = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (selectedTags.length > 0) {
    where.tags = { hasSome: selectedTags };
  }
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.gte = parseInt(minPrice);
    if (maxPrice) priceFilter.lte = parseInt(maxPrice);
    where.price = priceFilter;
  }

  const now = new Date();
  const [products, categories, tokoPage, activePromos, productsWithTags] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy:
        sort === "price_asc"
          ? { price: "asc" }
          : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.page.findUnique({ where: { slug: "toko" } }).catch(() => null),
    prisma.promotion
      .findMany({
        where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
      })
      .catch(() => []),
    prisma.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    }),
  ]);

  const allTags = [...new Set(productsWithTags.flatMap((p) => p.tags))].sort();

  const promotions: ActivePromotion[] = activePromos.map((p) => ({
    ...p,
    type: p.type as ActivePromotion["type"],
    discountMode: p.discountMode as ActivePromotion["discountMode"],
    discountValue: p.discountValue ? Number(p.discountValue.toString()) : null,
    minimumPurchase: p.minimumPurchase ? Number(p.minimumPurchase.toString()) : null,
    getDiscountMode: p.getDiscountMode as ActivePromotion["getDiscountMode"],
    getDiscountValue: p.getDiscountValue ? Number(p.getDiscountValue.toString()) : null,
    startAt: p.startAt.toISOString(),
    endAt: p.endAt.toISOString(),
  }));

  const blocks: Block[] = ((tokoPage?.craftJson as { blocks?: Block[] })?.blocks) ?? [];
  const heroBlock = blocks.find((b) => b.type === "Hero");
  const heroProps = heroBlock?.props as HeroProps | undefined;

  const headline = heroProps?.headline || "Produk Kami";
  const subheadline =
    heroProps?.subheadline || "Temukan produk Bee & Flower pilihan terbaik Anda";
  const fallbackBg = {
    bgType: "color" as const,
    bgColor: "#3A2D1D",
    bgImage: "",
    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 40,
  };
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
          <h1
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
            style={heroProps?.headlineColor ? { color: heroProps.headlineColor } : {}}
          >
            {headline}
          </h1>
          {subheadline && (
            <p
              className="text-brand-beige text-sm"
              style={heroProps?.subheadlineColor ? { color: heroProps.subheadlineColor } : {}}
            >
              {subheadline}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Sort bar */}
        <Suspense>
          <ShopFilters />
        </Suspense>

        {/* Sidebar + Products — uses lg:flex so sidebar is beside grid on desktop,
            stacked above grid on mobile (ShopSidebar handles its own mobile toggle) */}
        <div className="lg:flex lg:gap-6 lg:items-start mt-6">
          <Suspense>
            <ShopSidebar categories={categories} allTags={allTags} />
          </Suspense>

          <div className="flex-1 min-w-0 mt-4 lg:mt-0">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-brand-brown/50 text-lg">Produk tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      price: product.price.toString(),
                      comparePrice: product.comparePrice?.toString() ?? null,
                    }}
                    promotions={promotions}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
