"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type CouponStatus = "RUNNING" | "PENDING" | "ENDED" | "PAUSE" | "STOPPED";
type ActionType = "pause" | "resume" | "stop";

interface Props {
  couponId: string;
  couponCode: string;
  status: CouponStatus;
}

const ACTION_CONFIG: Record<ActionType, {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
}> = {
  pause: {
    label: "Jeda",
    title: "Jeda Kupon?",
    description: "Kupon akan dijeda sementara dan tidak bisa digunakan oleh pelanggan. Anda bisa mengaktifkan kembali kapan saja.",
    confirmLabel: "Ya, Jeda Kupon",
    confirmClass: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  resume: {
    label: "Aktifkan",
    title: "Aktifkan Kembali?",
    description: "Kupon akan diaktifkan kembali dan bisa digunakan oleh pelanggan.",
    confirmLabel: "Ya, Aktifkan",
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  stop: {
    label: "Stop",
    title: "Hentikan Kupon?",
    description: "Kupon akan dihentikan permanen dan tidak bisa diaktifkan kembali. Pelanggan tidak dapat menggunakan kode ini lagi.",
    confirmLabel: "Ya, Hentikan",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },
};

export function CouponStatusActions({ couponId, couponCode, status }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: ActionType) => {
    setLoading(true);
    try {
      const body =
        action === "pause" ? { isPaused: true, isStopped: false } :
        action === "resume" ? { isPaused: false } :
        { isStopped: true };

      await fetch(`/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setModal(null);
    }
  };

  const canPause = status === "RUNNING" || status === "PENDING";
  const canResume = status === "PAUSE";
  const canStop = status === "RUNNING" || status === "PENDING" || status === "PAUSE";

  if (!canPause && !canResume && !canStop) return null;

  return (
    <>
      <span className="text-gray-200">|</span>
      {canPause && (
        <button
          onClick={() => setModal("pause")}
          className="text-xs font-medium text-orange-500 hover:text-orange-700 transition-colors cursor-pointer"
        >
          Jeda
        </button>
      )}
      {canResume && (
        <button
          onClick={() => setModal("resume")}
          className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors cursor-pointer"
        >
          Aktifkan
        </button>
      )}
      {canStop && (
        <>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => setModal("stop")}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Stop
          </button>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {ACTION_CONFIG[modal].title}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Kupon: <span className="font-mono font-semibold text-brand-brown">{couponCode}</span>
            </p>
            <p className="text-sm text-gray-600 mb-5">
              {ACTION_CONFIG[modal].description}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(modal)}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${ACTION_CONFIG[modal].confirmClass}`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {ACTION_CONFIG[modal].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
