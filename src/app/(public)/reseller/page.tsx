import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { FAQSection } from "@/components/home/FAQSection";
import { isExternalUrl } from "@/lib/utils";
import Image from "next/image";
import type { HeroProps, FeatureIconsProps, FAQSectionProps, Block } from "@/types/pageBlocks";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Reseller - Bee & Flower Brand",
  description:
    "Bergabunglah sebagai reseller Bee & Flower dan mulai bisnis Anda dengan produk berkualitas tinggi.",
};

export default async function ResellerPage() {
  const [packages, resellerPage] = await Promise.all([
    prisma.resellerPackage
      .findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.page.findUnique({ where: { slug: "reseller" } }).catch(() => null),
  ]);

  const blocks: Block[] = ((resellerPage?.craftJson as { blocks?: Block[] })?.blocks) ?? [];
  const heroBlock = blocks.find((b) => b.type === "Hero");
  const benefitsBlock = blocks.find((b) => b.type === "FeatureIcons");
  const faqBlock = blocks.find((b) => b.type === "FAQSection");

  const heroProps = heroBlock?.props as HeroProps | undefined;
  const benefitsProps = benefitsBlock?.props as FeatureIconsProps | undefined;
  const faqItems = (faqBlock?.props as FAQSectionProps | undefined)?.items;

  const heroHeadline = heroProps?.headline || "Bangun Bisnis Bersama Bee & Flower";
  const heroSubheadline =
    heroProps?.subheadline ||
    "Produk yang telah dipercaya pelanggan, didukung sistem pemesanan yang mudah dan materi promosi yang siap digunakan.";
  const heroButton = heroProps?.buttonText || "GABUNG MENJADI RESELLER";
  const heroLink =
    heroProps?.buttonLink ||
    "https://wa.me/6285175273181?text=Halo,%20saya%20ingin%20menjadi%20reseller%20Bee%20%26%20Flower";

  const benefitItems = benefitsProps?.items ?? [
    { title: "Margin Kompetitif", description: "Dapatkan margin keuntungan yang menarik untuk setiap produk yang Anda jual." },
    { title: "Produk Original", description: "Semua produk terjamin original langsung dari distributor resmi." },
    { title: "Dukungan Katalog Produk", description: "Kami menyediakan katalog produk lengkap untuk memudahkan penjualan Anda." },
    { title: "Materi Promosi Digital", description: "Dapatkan materi promosi siap pakai untuk media sosial dan online shop." },
    { title: "Pengiriman ke seluruh Indonesia", description: "Layanan pengiriman ke seluruh wilayah Indonesia dengan aman." },
    { title: "Peluang Repeat Order", description: "Produk berkualitas yang dipercaya pelanggan mendorong pembelian berulang." },
  ];

  const heroBgStyle = getBlockBgStyle(heroProps ?? {});
  const heroShowOverlay = shouldShowOverlay(heroProps ?? {});
  const heroOverlayStyle = getOverlayStyle(heroProps ?? {});

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[420px] lg:min-h-[500px] overflow-hidden bg-brand-brown flex items-center" style={heroBgStyle}>
        {heroShowOverlay && (
          <div className="absolute inset-0 pointer-events-none" style={heroOverlayStyle} />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-4">
              Bergabunglah Bersama Kami
            </p>
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-4" style={heroProps?.headlineColor ? { color: heroProps.headlineColor } : {}}>
              {heroHeadline}
            </h1>
            <p className="text-brand-beige text-base lg:text-lg leading-relaxed mb-8 max-w-lg" style={heroProps?.subheadlineColor ? { color: heroProps.subheadlineColor } : {}}>
              {heroSubheadline}
            </p>
            <a
              href={heroLink}
              target={heroLink.startsWith("http") ? "_blank" : undefined}
              rel={heroLink.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ ...(heroProps?.buttonBgColor ? { backgroundColor: heroProps.buttonBgColor } : {}), ...(heroProps?.buttonTextColor ? { color: heroProps.buttonTextColor } : {}) }}
              className="inline-flex items-center px-7 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:opacity-90 transition-opacity"
            >
              {heroButton}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-xl lg:text-2xl text-brand-brown tracking-widest uppercase mb-3">
              {benefitsProps?.headline || "Mengapa Menjadi Reseller"}
            </h2>
            <p className="text-brand-brown/60 max-w-2xl mx-auto text-sm leading-relaxed">
              Bee & Flower merupakan produk dengan karakter aroma yang telah dikenal luas
              sehingga memiliki peluang repeat order yang baik.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefitItems.map((benefit, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 border border-brand-beige/30 rounded-xl hover:border-brand-gold/40 transition-colors"
              >
                <div className="w-14 h-14 rounded-full border-2 border-brand-gold/30 flex items-center justify-center mb-3 bg-brand-cream">
                  <span className="text-brand-gold font-bold text-lg select-none">✦</span>
                </div>
                <h3 className="font-bold text-brand-brown text-xs leading-tight">{benefit.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      {packages.length > 0 && (
        <section className="py-16 lg:py-24 bg-brand-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-bold text-xl lg:text-2xl text-brand-brown tracking-widest uppercase">
                Paket Reseller
              </h2>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-brand-beige/30"
                  >
                    {pkg.imageUrl && isExternalUrl(pkg.imageUrl) && (
                      <div className="relative aspect-[4/3] bg-brand-cream">
                        <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-brand-brown text-lg mb-3">{pkg.name}</h3>
                      <div className="mb-4 space-y-1">
                        {pkg.items.map((item, i) => (
                          <p key={i} className="text-xs text-brand-brown/70">
                            {item}
                          </p>
                        ))}
                      </div>
                      {pkg.originalPrice && (
                        <p className="text-sm text-brand-beige line-through mb-1">
                          {formatPrice(Number(pkg.originalPrice))}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-brand-brown mb-4">
                        {formatPrice(Number(pkg.price))}
                      </p>
                      <a
                        href={`https://wa.me/6285175273181?text=Halo,%20saya%20ingin%20memesan%20${encodeURIComponent(pkg.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-brand-brown transition-colors"
                      >
                        PILIH PAKET
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQSection items={faqItems} bgProps={faqBlock?.props} />
    </>
  );
}
