"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  proofId: string;
  orderId: string;
}

export function PaymentProofActions({ proofId, orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const handle = async (action: "verify" | "reject") => {
    setLoading(action);
    try {
      await fetch(`/api/payment/proof/${proofId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, orderId, reviewNotes }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <input
        value={reviewNotes}
        onChange={(e) => setReviewNotes(e.target.value)}
        placeholder="Catatan (opsional)"
        className="flex-1 min-w-0 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:border-brand-gold"
      />
      <button
        onClick={() => handle("verify")}
        disabled={!!loading}
        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
      >
        {loading === "verify" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Verifikasi
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={!!loading}
        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        Tolak
      </button>
    </div>
  );
}
