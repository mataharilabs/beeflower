import Image from "next/image";
import Link from "next/link";

export function BottomCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[300px]">
          {/* Text */}
          <div className="flex flex-col justify-center py-12 lg:py-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-3 leading-tight">
              Saatnya Menemukan Aroma Favorit Anda
            </h2>
            <p className="text-brand-brown/60 text-sm leading-relaxed mb-6 max-w-sm">
              Temukan koleksi Bee & Flower dan nikmati pengalaman mandi yang lebih
              berkesan setiap hari.
            </p>
            <Link
              href="/toko"
              className="inline-flex self-start items-center px-7 py-3 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-brand-brown transition-colors"
            >
              BELANJA SEKARANG
            </Link>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            <Image
              src="/images/cta-product.jpg"
              alt="Bee & Flower Products"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
