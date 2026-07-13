"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "createdAt";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/toko?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", search);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-beige" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-9 pr-4 py-2.5 border border-brand-beige/50 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-gold"
        />
      </form>

      {/* Category filter */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam("category", e.target.value)}
        className="px-4 py-2.5 border border-brand-beige/50 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-gold text-brand-brown min-w-[150px]"
      >
        <option value="">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="px-4 py-2.5 border border-brand-beige/50 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-gold text-brand-brown min-w-[150px]"
      >
        <option value="createdAt">Terbaru</option>
        <option value="price_asc">Harga: Rendah ke Tinggi</option>
        <option value="price_desc">Harga: Tinggi ke Rendah</option>
      </select>

      {isPending && (
        <span className="text-xs text-brand-beige self-center">Memuat...</span>
      )}
    </div>
  );
}
