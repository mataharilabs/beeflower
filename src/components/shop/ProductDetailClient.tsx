"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import type { VariantGroup, ProductVariant } from "@/types/variant";

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
  weight?: number | null;
  cartEnabled: boolean;
  cartButtonText: string | null;
  manualButtonEnabled: boolean;
  manualButtonText: string | null;
  manualButtonUrl: string | null;
  variantsEnabled?: boolean;
  variantWeightPerVariant?: boolean;
  variantGroups?: unknown;
  variants?: unknown;
}

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { addItem, openCart } = useCartStore();

  const basePrice = Number(product.price.toString());
  const comparePrice = product.comparePrice
    ? Number(product.comparePrice.toString())
    : null;

  // Variant data
  const variantsEnabled = product.variantsEnabled ?? false;
  const variantWeightPerVariant = product.variantWeightPerVariant ?? false;
  const variantGroups = (product.variantGroups as VariantGroup[] | null) ?? [];
  const variants = (product.variants as ProductVariant[] | null) ?? [];

  // Find matching variant for current selection
  const activeVariant =
    variantsEnabled && variants.length > 0
      ? variants.find((v) =>
          Object.keys(v.combination).every(
            (k) => selectedOptions[k] === v.combination[k]
          )
        ) ?? null
      : null;

  const allGroupsSelected =
    variantsEnabled &&
    variantGroups.length > 0 &&
    variantGroups.every((g) => selectedOptions[g.name]);

  // Effective values based on selection
  const effectivePrice = allGroupsSelected && activeVariant ? activeVariant.price : basePrice;
  const effectiveStock = allGroupsSelected && activeVariant ? activeVariant.stock : product.stock;
  const effectiveWeight =
    variantsEnabled && variantWeightPerVariant && allGroupsSelected && activeVariant?.weight != null
      ? activeVariant.weight
      : product.weight;
  const effectiveImage =
    allGroupsSelected && activeVariant?.imageUrl
      ? activeVariant.imageUrl
      : product.images[selectedImage] || "/images/product-placeholder.jpg";

  // Check if an option still has stock given other selections
  const optionHasStock = (groupName: string, optionValue: string) => {
    const testSelection = { ...selectedOptions, [groupName]: optionValue };
    return variants.some((v) => {
      const matchesAll = Object.keys(v.combination).every(
        (k) => testSelection[k] === undefined || testSelection[k] === v.combination[k]
      );
      return matchesAll && v.stock > 0;
    });
  };

  const handleAddToCart = () => {
    if (variantsEnabled && variantGroups.length > 0 && !allGroupsSelected) return;

    const variantLabel = allGroupsSelected
      ? Object.entries(selectedOptions)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : null;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
        price: effectivePrice,
        image: effectiveImage,
        slug: product.slug,
        stock: effectiveStock,
      });
    }
    openCart();
  };

  const canAddToCart =
    effectiveStock > 0 &&
    (!variantsEnabled || !variantGroups.length || allGroupsSelected);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-cream">
              <Image
                src={effectiveImage}
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

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-brand-brown">
                {formatPrice(effectivePrice)}
              </span>
              {comparePrice && comparePrice > basePrice && !allGroupsSelected && (
                <span className="text-lg text-brand-beige line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
              {allGroupsSelected && activeVariant && activeVariant.price !== basePrice && (
                <span className="text-sm text-brand-beige line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>

            {product.shortDesc && (
              <p className="text-brand-brown/70 leading-relaxed mb-4 text-sm">
                {product.shortDesc}
              </p>
            )}

            {/* Variant selector */}
            {variantsEnabled && variantGroups.length > 0 && (
              <div className="space-y-4 mb-5">
                {variantGroups.map((group) => (
                  <div key={group.id}>
                    <p className="text-sm font-semibold text-brand-brown mb-2">
                      {group.name}
                      {selectedOptions[group.name] && (
                        <span className="font-normal text-brand-brown/60 ml-1.5">
                          : {selectedOptions[group.name]}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => {
                        const hasStock = optionHasStock(group.name, opt);
                        const isSelected = selectedOptions[group.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((p) => ({ ...p, [group.name]: opt }))
                            }
                            disabled={!hasStock}
                            className={`relative px-4 py-1.5 text-sm border rounded-lg transition-all disabled:cursor-not-allowed ${
                              isSelected
                                ? "border-brand-gold bg-brand-gold text-white font-semibold shadow-sm"
                                : hasStock
                                ? "border-brand-beige text-brand-brown hover:border-brand-gold"
                                : "border-gray-200 text-gray-300 line-through"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!allGroupsSelected && (
                  <p className="text-xs text-amber-600">
                    Pilih{" "}
                    {variantGroups
                      .filter((g) => !selectedOptions[g.name])
                      .map((g) => g.name)
                      .join(", ")}{" "}
                    terlebih dahulu
                  </p>
                )}
              </div>
            )}

            {/* Quantity + stock info */}
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
                  onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                  disabled={quantity >= effectiveStock || !canAddToCart}
                  className="px-3 py-2 text-brand-brown hover:bg-brand-cream transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {allGroupsSelected || !variantsEnabled ? (
                <span className="text-xs text-brand-beige">Stok: {effectiveStock}</span>
              ) : null}
              {effectiveWeight != null && (
                <span className="text-xs text-brand-beige">Berat: {effectiveWeight} gr</span>
              )}
            </div>

            {/* CTA */}
            <div className="space-y-3">
              {product.cartEnabled && (
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-brand-gold text-white font-semibold rounded-lg tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {effectiveStock === 0 && (allGroupsSelected || !variantsEnabled)
                    ? "STOK HABIS"
                    : variantsEnabled && variantGroups.length > 0 && !allGroupsSelected
                    ? "PILIH VARIANT DULU"
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
            <h2 className="text-xl font-bold text-brand-brown mb-6">Produk Terkait</h2>
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
