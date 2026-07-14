"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, isExternalUrl } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string | number | { toString(): string };
  comparePrice?: string | number | { toString(): string } | null;
  images: string[];
  stock: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const price = Number(product.price.toString());
  const comparePrice = product.comparePrice ? Number(product.comparePrice.toString()) : null;
  const image = product.images[0] ?? "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price,
      image,
      slug: product.slug,
      stock: product.stock,
    });
  };

  return (
    <Link
      href={`/toko/${product.slug}`}
      className="group block bg-white border border-brand-beige/30 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square bg-brand-cream overflow-hidden">
        {isExternalUrl(image) ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-brand-cream to-brand-beige/30">
            <span className="text-3xl font-bold text-brand-gold/20 select-none">B&F</span>
          </div>
        )}
      </div>
      <div className="p-3 lg:p-4">
        <h3 className="font-semibold text-sm text-brand-brown line-clamp-2 mb-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-bold text-brand-brown text-base">
            {formatPrice(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-brand-beige line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-2 text-sm font-semibold tracking-wide border-2 border-brand-gold text-brand-gold rounded hover:bg-brand-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "HABIS" : "BELI"}
        </button>
      </div>
    </Link>
  );
}
