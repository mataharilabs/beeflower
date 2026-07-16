"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  price: { toString(): string };
  comparePrice?: { toString(): string } | null;
  images: string[];
  stock: number;
  category: { name: string } | null;
  cartEnabled: boolean;
  cartButtonText: string | null;
  manualButtonEnabled: boolean;
  manualButtonText: string | null;
  manualButtonUrl: string | null;
}

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCartStore();

  const price = Number(product.price.toString());
  const comparePrice = product.comparePrice
    ? Number(product.comparePrice.toString())
    : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price,
        image: product.images[0] || "/images/product-placeholder.jpg",
        slug: product.slug,
        stock: product.stock,
      });
    }
    openCart();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-cream">
              <Image
                src={product.images[selectedImage] || "/images/product-placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-brand-gold" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs text-brand-gold font-semibold tracking-widest uppercase mb-2">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-brown">
                {formatPrice(price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-lg text-brand-beige line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            {product.shortDesc && (
              <p className="text-brand-brown/70 leading-relaxed mb-6 text-sm">
                {product.shortDesc}
              </p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-brand-brown">Jumlah:</span>
              <div className="flex items-center border border-brand-beige rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-brand-brown hover:bg-brand-cream transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[40px] text-center font-medium text-brand-brown">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 text-brand-brown hover:bg-brand-cream transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-brand-beige">
                Stok: {product.stock}
              </span>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              {product.cartEnabled && (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-brand-gold text-white font-semibold rounded-lg tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0
                    ? "STOK HABIS"
                    : (product.cartButtonText?.trim() || "TAMBAH KE KERANJANG").toUpperCase()}
                </button>
              )}
              {product.manualButtonEnabled && product.manualButtonUrl && (
                <a
                  href={product.manualButtonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-brand-brown text-white font-semibold rounded-lg tracking-wide hover:bg-black/80 transition-colors"
                >
                  {(product.manualButtonText?.trim() || "HUBUNGI KAMI").toUpperCase()}
                </a>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-brand-beige/30">
                <h3 className="font-bold text-brand-brown mb-3">Deskripsi Produk</h3>
                <p className="text-brand-brown/70 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-brand-brown mb-6">
              Produk Terkait
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    ...p,
                    price: Number(p.price.toString()),
                    comparePrice: p.comparePrice
                      ? Number(p.comparePrice.toString())
                      : null,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
