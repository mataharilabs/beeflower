import Link from "next/link";
import Image from "next/image";
import { isExternalUrl } from "@/lib/utils";

interface OurStoryData {
  headline?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function OurStory({ data }: { data?: OurStoryData }) {
  const headline = data?.headline || "Lebih dari Sekedar Sabun";
  const content =
    data?.content ||
    "Selama bertahun-tahun, Bee & Flower dikenal melalui aroma khas dan kualitas produknya. Dengan karakter klasik yang tetap relevan hingga kini, Bee & Flower hadir sebagai pilihan untuk Anda yang menghargai keharuman, kenyamanan, dan kualitas dalam setiap rutinitas perawatan diri.";
  const buttonText = data?.buttonText || "Tentang Bee & Flower";
  const buttonLink = data?.buttonLink || "/reseller";
  const imageUrl = data?.imageUrl;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-3">
              Our Story
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown leading-tight mb-6">
              {headline}
            </h2>
            <p className="text-brand-brown/70 leading-relaxed mb-4">{content}</p>
            <Link
              href={buttonLink}
              className="inline-flex items-center mt-4 px-6 py-3 border-2 border-brand-brown text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-brown hover:text-white transition-colors"
            >
              {buttonText}
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-brand-cream flex items-center justify-center">
              {isExternalUrl(imageUrl) ? (
                <Image src={imageUrl!} alt={headline} fill className="object-cover" />
              ) : (
                <div className="text-center select-none">
                  <p className="text-[80px] font-bold text-brand-gold/20 leading-none">.B&F</p>
                  <p className="text-brand-beige text-sm mt-2 tracking-widest uppercase">
                    Bee &amp; Flower Brand
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
