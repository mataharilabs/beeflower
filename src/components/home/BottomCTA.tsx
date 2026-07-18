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
}

export function BottomCTA({ data }: { data?: CTAData }) {
  const headline = data?.headline || "Saatnya Menemukan Aroma Favorit Anda";
  const subheadline =
    data?.subheadline ||
    "Temukan koleksi Bee & Flower dan nikmati pengalaman mandi yang lebih berkesan setiap hari.";
  const buttonText = data?.buttonText || "BELANJA SEKARANG";
  const buttonLink = data?.buttonLink || "/toko";

  const hasCustomBg = !!data?.bgType;
  const bgStyle = hasCustomBg ? getBlockBgStyle(data) : {};
  const showOverlay = hasCustomBg && shouldShowOverlay(data);
  const overlayStyle = getOverlayStyle(data);

  return (
    <section
      className={`relative py-16 lg:py-20 ${!hasCustomBg ? "bg-brand-gold" : ""}`}
      style={bgStyle}
    >
      {showOverlay && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
          {headline}
        </h2>
        <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          {subheadline}
        </p>
        <Link
          href={buttonLink}
          className="inline-flex items-center px-7 py-3 bg-white text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-cream transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
