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
import type {
  ImageTextProps,
  FeatureIconsProps,
  FAQSectionProps,
  CTABannerProps,
  Block,
} from "@/types/pageBlocks";

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
  const [banners, homePage, featuredProducts, bestSellerProducts, highlightProduct] =
    await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.page.findUnique({ where: { slug: "home" } }),
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
    ]).catch(() => [[], null, [], [], null]);

  const bannersData = Array.isArray(banners) ? banners : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredData = (Array.isArray(featuredProducts) ? featuredProducts : []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bestSellersData = (Array.isArray(bestSellerProducts) ? bestSellerProducts : []) as any[];

  // Extract editable content from home page CMS blocks
  const blocks: Block[] = ((homePage?.craftJson as { blocks?: Block[] })?.blocks) ?? [];
  const ourStoryBlock = blocks.find((b) => b.type === "ImageText");
  const whyBFBlock = blocks.find((b) => b.type === "FeatureIcons");
  const faqBlock = blocks.find((b) => b.type === "FAQSection");
  const ctaBanners = blocks.filter((b) => b.type === "CTABanner");

  return (
    <>
      <HeroBannerSlider banners={bannersData} />
      <OurStory data={ourStoryBlock?.props as ImageTextProps | undefined} />
      <OurCollection products={featuredData} />
      <WhyBeeFlower items={(whyBFBlock?.props as FeatureIconsProps | undefined)?.items} />
      {highlightProduct && !Array.isArray(highlightProduct) && (
        <ProductHighlight
          product={
            highlightProduct as { name: string; slug: string; shortDesc: string | null; images: string[] }
          }
        />
      )}
      <BestSellers products={bestSellersData} />
      <BusinessOpportunityCTA data={ctaBanners[0]?.props as CTABannerProps | undefined} />
      <FAQSection items={(faqBlock?.props as FAQSectionProps | undefined)?.items} />
      <BottomCTA data={ctaBanners[1]?.props as CTABannerProps | undefined} />
    </>
  );
}
