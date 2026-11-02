"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, StopCircle, Loader2 } from "lucide-react";

interface Props {
  couponId: string;
  isPaused: boolean;
  isStopped: boolean;
}

type ModalType = "pause" | "resume" | "stop";

const MODAL_CONFIG: Record<ModalType, { title: string; description: string; confirmLabel: string; confirmClass: string }> = {
  pause: {
    title: "Jeda Kupon?",
    description: "Kupon akan dijeda sementara dan tidak bisa digunakan oleh pelanggan. Anda bisa mengaktifkan kembali kapan saja.",
    confirmLabel: "Ya, Jeda",
    confirmClass: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  resume: {
    title: "Aktifkan Kembali?",
    description: "Kupon akan diaktifkan kembali dan bisa digunakan oleh pelanggan.",
    confirmLabel: "Ya, Aktifkan",
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  stop: {
    title: "Hentikan Kupon Permanen?",
    description: "Kupon akan dihentikan secara permanen. Status ini tidak bisa dikembalikan dan pelanggan tidak akan bisa menggunakan kode ini lagi.",
    confirmLabel: "Ya, Hentikan Permanen",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },
};

export function CouponStatusButtons({ couponId, isPaused, isStopped }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalType | null>(null);

  const patch = async (data: Record<string, boolean>) => {
    setLoading(true);
    try {
      await fetch(`/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setModal(null);
    }
  };

  const handleConfirm = (action: ModalType) => {
    if (action === "pause") patch({ isPaused: true, isStopped: false });
    else if (action === "resume") patch({ isPaused: false });
    else patch({ isStopped: true });
  };

  if (isStopped) {
    return <span className="text-xs text-gray-400 italic">Dihentikan permanen</span>;
  }

  return (
    <>
      <div className="flex gap-2">
        {isPaused ? (
          <button
            onClick={() => setModal("resume")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Aktifkan
          </button>
        ) : (
          <button
            onClick={() => setModal("pause")}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Pause className="w-3.5 h-3.5" />
            Jeda
          </button>
        )}
        <button
          onClick={() => setModal("stop")}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <StopCircle className="w-3.5 h-3.5" />
          Stop
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">{MODAL_CONFIG[modal].title}</h3>
            <p className="text-sm text-gray-600 mb-5">{MODAL_CONFIG[modal].description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirm(modal)}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${MODAL_CONFIG[modal].confirmClass}`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {MODAL_CONFIG[modal].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
