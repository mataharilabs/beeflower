"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Diterima" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Semua Pembayaran" },
  { value: "XENDIT", label: "Xendit Online" },
  { value: "MANUAL_TRANSFER", label: "Transfer Bank" },
  { value: "QRIS", label: "QRIS" },
];

interface Props {
  initialSearch: string;
  initialStatus: string;
  initialPayment: string;
}

export function OrderFilters({ initialSearch, initialStatus, initialPayment }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari nama pelanggan atau no. pesanan..."
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

      {/* Status filter */}
      <select
        value={initialStatus}
        onChange={(e) => handleFilter("status", e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold text-gray-600 bg-white"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Payment filter */}
      <select
        value={initialPayment}
        onChange={(e) => handleFilter("payment", e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold text-gray-600 bg-white"
      >
        {PAYMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
