import Image from "next/image";
import Link from "next/link";

export function OurStory() {
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
              Lebih dari Sekedar Sabun
            </h2>
            <p className="text-brand-brown/70 leading-relaxed mb-4">
              Selama bertahun-tahun, Bee & Flower dikenal melalui aroma khas dan
              kualitas produknya. Dengan karakter klasik yang tetap relevan hingga
              kini, Bee & Flower hadir sebagai pilihan untuk Anda yang menghargai
              keharuman, kenyamanan, dan kualitas dalam setiap rutinitas perawatan
              diri.
            </p>
            <Link
              href="/reseller"
              className="inline-flex items-center mt-4 px-6 py-3 border-2 border-brand-brown text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-brown hover:text-white transition-colors"
            >
              Tentang Bee & Flower
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-brand-cream">
              <Image
                src="/images/our-story.jpg"
                alt="Bee & Flower - Our Story"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
