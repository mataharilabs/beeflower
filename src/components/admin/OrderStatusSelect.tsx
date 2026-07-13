"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Menunggu Pembayaran" },
  { value: "PAID", label: "Sudah Dibayar" },
  { value: "PROCESSING", label: "Sedang Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Diterima" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: e.target.value }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={saving}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
