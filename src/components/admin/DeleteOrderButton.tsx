"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  orderId: string;
  orderNumber: string;
  redirectAfter?: string;
}

export function DeleteOrderButton({ orderId, orderNumber, redirectAfter }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Hapus pesanan #${orderNumber}?\nStok produk akan dikembalikan untuk status PENDING/PAID/PROCESSING.\nTindakan ini tidak dapat dibatalkan.`
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        redirectAfter ? router.push(redirectAfter) : router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Hapus Pesanan"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
