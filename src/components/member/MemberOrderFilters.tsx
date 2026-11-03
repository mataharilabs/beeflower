"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu Pembayaran" },
  { value: "PAYMENT_CONFIRMATION", label: "Konfirmasi Pembayaran" },
  { value: "PAID", label: "Pembayaran Diterima" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Diterima" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

interface Props {
  initialSearch: string;
  initialStatus: string;
}

export function MemberOrderFilters({ initialSearch, initialStatus }: Props) {
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

  const handleStatus = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("status", val);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-beige pointer-events-none" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari nama produk atau no. pesanan..."
          className="w-full pl-9 pr-9 py-2 border border-brand-beige/40 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-brand-beige animate-spin" />
          ) : value ? (
            <button type="button" onClick={() => setValue("")} className="text-brand-beige hover:text-brand-brown">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <select
        value={initialStatus}
        onChange={(e) => handleStatus(e.target.value)}
        className="px-3 py-2 border border-brand-beige/40 rounded-lg text-sm focus:outline-none focus:border-brand-gold text-brand-brown bg-white"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
