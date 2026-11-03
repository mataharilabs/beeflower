import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroBannerSlider } from "@/components/home/HeroBannerSlider";
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
  const [banners, homePage] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    prisma.page.findUnique({ where: { slug: "home" } }),
  ]).catch(() => [[], null]);

  const bannersData = Array.isArray(banners) ? banners : [];
  const homePageData = !Array.isArray(homePage) ? homePage : null;

  return (
    <>
      <HeroBannerSlider banners={bannersData} />
      {homePageData?.craftJson && (
        <BlockRenderer document={homePageData.craftJson as object} />
      )}
    </>
  );
}
