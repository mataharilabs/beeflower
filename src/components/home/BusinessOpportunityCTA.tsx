import Image from "next/image";
import Link from "next/link";

export function BusinessOpportunityCTA() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/business-cta-bg.jpg"
          alt="Business Opportunity"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-brown/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-4">
            Business Opportunity
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            Jadilah <strong className="text-brand-gold">Bagian</strong>
            <br />
            Dari <strong>Perjalanan Bee & Flower</strong>
          </h2>
          <p className="text-brand-beige text-base leading-relaxed mb-8 max-w-lg">
            Mulai bisnis Anda bersama produk yang telah dikenal luas dan didukung dengan
            materi promosi serta harga khusus untuk reseller.
          </p>
          <Link
            href="/reseller"
            className="inline-flex items-center px-7 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-white hover:text-brand-brown transition-colors"
          >
            GABUNG SEKARANG
          </Link>
        </div>
      </div>
    </section>
  );
}
