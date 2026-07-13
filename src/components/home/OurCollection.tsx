import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  images: string[];
}

interface OurCollectionProps {
  products: Product[];
}

export function OurCollection({ products }: OurCollectionProps) {
  return (
    <section className="py-16 lg:py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2">
            Our Collection
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-3">
            Temukan Aroma favorit Anda
          </h2>
          <p className="text-brand-brown/60 max-w-xl mx-auto text-sm leading-relaxed">
            Bee & Flower dirancang untuk menghadirkan pengalaman mandi yang berbeda
            sesuai karakter dan preferensi Anda.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/toko/${product.slug}`}
              className="group block"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-cream mb-3">
                <Image
                  src={product.images[0] || "/images/product-placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-brand-brown text-base mb-1">
                {product.name}
              </h3>
              {product.shortDesc && (
                <p className="text-xs text-brand-brown/60 mb-2 line-clamp-2">
                  {product.shortDesc}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gold group-hover:gap-2 transition-all">
                LIHAT PRODUK <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
