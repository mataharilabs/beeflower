"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, StopCircle, Loader2 } from "lucide-react";

interface Props {
  couponId: string;
  isPaused: boolean;
  isStopped: boolean;
}

export function CouponStatusButtons({ couponId, isPaused, isStopped }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (action: string, data: Record<string, boolean>) => {
    setLoading(action);
    try {
      await fetch(`/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (isStopped) {
    return (
      <span className="text-xs text-gray-400 italic">Dihentikan permanen</span>
    );
  }

  return (
    <div className="flex gap-2">
      {isPaused ? (
        <button
          onClick={() => patch("resume", { isPaused: false })}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading === "resume" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Aktifkan
        </button>
      ) : (
        <button
          onClick={() => patch("pause", { isPaused: true })}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading === "pause" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
          Jeda
        </button>
      )}
      <button
        onClick={() => {
          if (!confirm("Hentikan kupon ini secara permanen? Status tidak bisa dikembalikan.")) return;
          patch("stop", { isStopped: true });
        }}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "stop" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
        Stop
      </button>
    </div>
  );
}
