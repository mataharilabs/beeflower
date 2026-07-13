"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  image: string;
  headline: string | null;
  subheadline: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

interface HeroBannerSliderProps {
  banners: Banner[];
}

export function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="relative flex-none w-full min-h-[520px] lg:min-h-[620px]">
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src={banner.image || "/images/hero-placeholder.jpg"}
                  alt={banner.headline || "Bee & Flower Brand"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[520px] lg:min-h-[620px] flex items-center">
                <div className="max-w-xl py-16">
                  {banner.headline && (
                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-brown leading-tight mb-4">
                      {banner.headline}
                    </h1>
                  )}
                  {banner.subheadline && (
                    <p className="text-base lg:text-lg text-brand-brown/70 leading-relaxed mb-8 max-w-sm">
                      {banner.subheadline}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    {banner.buttonText && banner.buttonLink && (
                      <Link
                        href={banner.buttonLink}
                        className="inline-flex items-center px-6 py-3 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-brand-brown transition-colors"
                      >
                        {banner.buttonText}
                      </Link>
                    )}
                    <Link
                      href="/toko"
                      className="inline-flex items-center px-6 py-3 border-2 border-brand-brown text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-brown hover:text-white transition-colors"
                    >
                      JELAJAHI AROMA
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                index === 0 ? "bg-brand-gold w-6" : "bg-brand-beige"
              )}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
