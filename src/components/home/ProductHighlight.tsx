import Image from "next/image";
import Link from "next/link";

interface Product {
  name: string;
  slug: string;
  shortDesc: string | null;
  images: string[];
}

export function ProductHighlight({ product }: { product: Product | null }) {
  if (!product) return null;

  return (
    <section className="relative py-20 lg:py-28 bg-brand-brown overflow-hidden">
      {/* Background product image */}
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 lg:opacity-50">
        <Image
          src={product.images[0] || "/images/product-placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-brown via-brand-brown/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-3">
            Product Highlight
          </p>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {product.name}
          </h2>
          {product.shortDesc && (
            <p className="text-brand-beige text-base leading-relaxed mb-8">
              {product.shortDesc}
            </p>
          )}
          <Link
            href={`/toko/${product.slug}`}
            className="inline-flex items-center px-7 py-3.5 bg-brand-gold text-white font-semibold text-sm rounded tracking-wide hover:bg-white hover:text-brand-brown transition-colors"
          >
            LIHAT PRODUK
          </Link>
        </div>
      </div>
    </section>
  );
}
