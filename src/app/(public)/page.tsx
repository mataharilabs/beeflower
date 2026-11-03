import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroBannerSlider } from "@/components/home/HeroBannerSlider";
import { ProductHighlight } from "@/components/home/ProductHighlight";
import { BestSellers } from "@/components/home/BestSellers";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return {
    title: settings?.metaTitle ?? settings?.siteName ?? "Bee & Flower Brand",
    description:
      settings?.metaDescription ??
      "Sabun berkualitas dengan aroma khas yang telah dipercaya lintas generasi sejak tahun 1928",
    openGraph: {
      images: settings?.ogImage ? [settings.ogImage] : [],
    },
  };
}

export default async function HomePage() {
  const [banners, homePage, bestSellerProducts, highlightProduct] =
    await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.page.findUnique({ where: { slug: "home" } }),
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.product.findFirst({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
      }),
    ]).catch(() => [[], null, [], null]);

  const bannersData = Array.isArray(banners) ? banners : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bestSellersData = (Array.isArray(bestSellerProducts) ? bestSellerProducts : []) as any[];
  const homePageData = !Array.isArray(homePage) ? homePage : null;

  return (
    <>
      <HeroBannerSlider banners={bannersData} />
      {homePageData?.craftJson && (
        <BlockRenderer document={homePageData.craftJson as object} />
      )}
      {highlightProduct && !Array.isArray(highlightProduct) && (
        <ProductHighlight
          product={
            highlightProduct as { name: string; slug: string; shortDesc: string | null; images: string[] }
          }
        />
      )}
      <BestSellers products={bestSellersData} />
    </>
  );
}
