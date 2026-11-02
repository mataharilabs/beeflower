"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function CouponFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        if (search.trim()) params.set("search", search.trim());
        else params.delete("search");
        router.push(`/admin/coupons?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari kode atau judul kupon..."
        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold w-64"
      />
    </div>
  );
}
