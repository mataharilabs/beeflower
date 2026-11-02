"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  allTags: string[];
}

export function ShopSidebar({ categories, allTags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const currentCategory = searchParams.get("category") ?? "";
  const currentTagsParam = searchParams.get("tags") ?? "";
  const currentTags = currentTagsParam ? currentTagsParam.split(",").filter(Boolean) : [];

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/toko?${params.toString()}`));
  };

  const toggleTag = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateParam("tags", newTags.join(","));
  };

  const applyPriceRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    startTransition(() => router.push(`/toko?${params.toString()}`));
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("tags");
    params.delete("minPrice");
    params.delete("maxPrice");
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => router.push(`/toko?${params.toString()}`));
  };

  const hasActiveFilters =
    !!currentCategory ||
    currentTags.length > 0 ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice");

  const sidebarContent = (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <X className="w-3 h-3" />
          Hapus semua filter
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-brand-brown text-sm mb-3">Kategori</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="sidebar-category"
              value=""
              checked={currentCategory === ""}
              onChange={() => updateParam("category", "")}
              className="accent-amber-700 w-4 h-4"
            />
            <span className="text-sm text-gray-700 group-hover:text-brand-gold transition-colors">
              Semua Kategori
            </span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="sidebar-category"
                value={cat.id}
                checked={currentCategory === cat.id}
                onChange={() => updateParam("category", cat.id)}
                className="accent-amber-700 w-4 h-4"
              />
              <span className="text-sm text-gray-700 group-hover:text-brand-gold transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <h3 className="font-semibold text-brand-brown text-sm mb-3">Tags</h3>
          <div className="space-y-2">
            {allTags.map((tag) => (
              <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={currentTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  className="accent-amber-700 w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700 group-hover:text-brand-gold transition-colors capitalize">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-brand-brown text-sm mb-3">Rentang Harga</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min (Rp)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max (Rp)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Tidak terbatas"
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-brand-gold"
            />
          </div>
          <button
            onClick={applyPriceRange}
            disabled={isPending}
            className="w-full py-2 bg-brand-gold text-white text-xs font-medium rounded-lg hover:bg-brand-brown transition-colors disabled:opacity-60"
          >
            {isPending ? "Memuat..." : "Terapkan"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 px-4 py-2.5 border border-brand-beige/50 rounded-lg text-sm bg-white text-brand-brown w-full sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-brand-gold rounded-full" />
          )}
          <span className="ml-auto">
            {mobileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>
        {mobileOpen && (
          <div className="mt-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            {sidebarContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
            <h2 className="font-semibold text-brand-brown">Filter</h2>
          </div>
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
