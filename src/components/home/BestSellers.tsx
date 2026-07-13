import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string | number | { toString(): string };
  comparePrice?: string | number | { toString(): string } | null;
  images: string[];
  stock: number;
}

interface BestSellersProps {
  products: Product[];
}

export function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-gold font-semibold text-sm tracking-widest uppercase mb-2">
            Produk Favorit
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown tracking-wide">
            BEST SELLER
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/toko"
            className="inline-flex items-center px-8 py-3 border-2 border-brand-gold text-brand-gold font-semibold text-sm rounded tracking-wide hover:bg-brand-gold hover:text-white transition-colors"
          >
            LIHAT SEMUA PRODUK
          </Link>
        </div>
      </div>
    </section>
  );
}
