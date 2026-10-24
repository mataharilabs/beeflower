"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export function ProductFilters({ initialSearch }: { initialSearch: string }) {
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

  const clear = () => setValue("");

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari nama produk..."
        className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isPending ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : value ? (
          <button type="button" onClick={clear} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
