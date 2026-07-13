import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroBannerSlider } from "@/components/home/HeroBannerSlider";
import { OurStory } from "@/components/home/OurStory";
import { OurCollection } from "@/components/home/OurCollection";
import { WhyBeeFlower } from "@/components/home/WhyBeeFlower";
import { ProductHighlight } from "@/components/home/ProductHighlight";
import { BestSellers } from "@/components/home/BestSellers";
import { BusinessOpportunityCTA } from "@/components/home/BusinessOpportunityCTA";
import { FAQSection } from "@/components/home/FAQSection";
import { BottomCTA } from "@/components/home/BottomCTA";

export const revalidate = 900; // 15 minutes ISR

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  }).catch(() => null);

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
  const [banners, featuredProducts, bestSellerProducts, highlightProduct] =
    await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.product.findFirst({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
      }),
    ]).catch(() => [[], [], [], null]);

  const bannersData = Array.isArray(banners) ? banners : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredData = (Array.isArray(featuredProducts) ? featuredProducts : []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bestSellersData = (Array.isArray(bestSellerProducts) ? bestSellerProducts : []) as any[];

  return (
    <>
      <HeroBannerSlider banners={bannersData} />
      <OurStory />
      <OurCollection products={featuredData} />
      <WhyBeeFlower />
      {highlightProduct && !Array.isArray(highlightProduct) && (
        <ProductHighlight product={highlightProduct as { name: string; slug: string; shortDesc: string | null; images: string[] }} />
      )}
      <BestSellers products={bestSellersData} />
      <BusinessOpportunityCTA />
      <FAQSection />
      <BottomCTA />
    </>
  );
}
