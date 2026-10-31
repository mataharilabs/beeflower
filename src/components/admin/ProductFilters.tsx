"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface Props {
  initialSearch: string;
  initialSort: string;
}

export function ProductFilters({ initialSearch, initialSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "createdAt") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari nama produk atau SKU..."
          className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : value ? (
            <button type="button" onClick={() => setValue("")} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Sort */}
      <select
        value={initialSort}
        onChange={(e) => handleSort(e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold text-gray-600 bg-white"
      >
        <option value="createdAt">Produk Terbaru</option>
        <option value="updatedAt">Terakhir Diupdate</option>
      </select>
    </div>
  );
}
