import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import type { ActivePromotion } from "@/lib/promotions";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  }).catch(() => null);

  return {
    title: product.metaTitle ?? `${product.name} | ${settings?.siteName ?? "Bee & Flower Brand"}`,
    description: product.metaDescription ?? product.shortDesc ?? undefined,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description: product.metaDescription ?? product.shortDesc ?? undefined,
      images: product.ogImage
        ? [product.ogImage]
        : product.images.length > 0
        ? [product.images[0]]
        : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const now = new Date();
  const [product, activePromos] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true },
    }),
    prisma.promotion.findMany({
      where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
    }).catch(() => []),
  ]);

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: true },
  });

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

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      promotions={promotions}
    />
  );
}
