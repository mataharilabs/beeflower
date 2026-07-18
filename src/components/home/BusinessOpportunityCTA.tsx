import Link from "next/link";
import { getBlockBgStyle, shouldShowOverlay, getOverlayStyle } from "@/lib/blockBackground";

interface CTAData {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  bgType?: string;
  bgColor?: string;
  bgImage?: string;
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  headlineColor?: string;
  subheadlineColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export function BusinessOpportunityCTA({ data }: { data?: CTAData }) {
  const headline = data?.headline || "Jadilah Bagian Dari Perjalanan Bee & Flower";
  const subheadline =
    data?.subheadline ||
    "Mulai bisnis Anda bersama produk yang telah dikenal luas dan didukung dengan materi promosi serta harga khusus untuk reseller.";
  const buttonText = data?.buttonText || "GABUNG SEKARANG";
  const buttonLink = data?.buttonLink || "/reseller";

  const hasCustomBg = !!data?.bgType;
  const bgStyle = hasCustomBg ? getBlockBgStyle(data) : {};
  const showOverlay = hasCustomBg && shouldShowOverlay(data);
  const overlayStyle = getOverlayStyle(data);
  const btnStyle = {
    ...(data?.buttonBgColor ? { backgroundColor: data.buttonBgColor } : {}),
    ...(data?.buttonTextColor ? { color: data.buttonTextColor } : {}),
  };

  return (
    <section
      className={`relative py-20 lg:py-28 overflow-hidden ${!hasCustomBg ? "bg-brand-brown" : ""}`}
      style={bgStyle}
    >
      {!hasCustomBg && (
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute bottom-0 right-0 text-[300px] font-bold text-brand-gold/30 leading-none tracking-tighter">
            B&F
          </div>
        </div>
      )}
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-4">
            Business Opportunity
          </p>
          <h2
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight"
            style={data?.headlineColor ? { color: data.headlineColor } : {}}
          >
            {headline}
          </h2>
          <p
            className="text-brand-beige text-base leading-relaxed mb-8 max-w-lg"
            style={data?.subheadlineColor ? { color: data.subheadlineColor } : {}}
          >
            {subheadline}
          </p>
          <Link
            href={buttonLink}
            style={btnStyle}
            className="inline-flex items-center px-7 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:opacity-90 transition-opacity"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
