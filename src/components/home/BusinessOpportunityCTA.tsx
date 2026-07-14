import Link from "next/link";

interface CTAData {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function BusinessOpportunityCTA({ data }: { data?: CTAData }) {
  const headline = data?.headline || "Jadilah Bagian Dari Perjalanan Bee & Flower";
  const subheadline =
    data?.subheadline ||
    "Mulai bisnis Anda bersama produk yang telah dikenal luas dan didukung dengan materi promosi serta harga khusus untuk reseller.";
  const buttonText = data?.buttonText || "GABUNG SEKARANG";
  const buttonLink = data?.buttonLink || "/reseller";

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-brand-brown">
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute bottom-0 right-0 text-[300px] font-bold text-brand-gold/30 leading-none tracking-tighter">
          B&F
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-4">
            Business Opportunity
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            {headline}
          </h2>
          <p className="text-brand-beige text-base leading-relaxed mb-8 max-w-lg">
            {subheadline}
          </p>
          <Link
            href={buttonLink}
            className="inline-flex items-center px-7 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-white hover:text-brand-brown transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
