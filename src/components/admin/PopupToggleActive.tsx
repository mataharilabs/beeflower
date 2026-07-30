"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PopupToggleActive({ popupId, isActive }: { popupId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/popups/${popupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50 ${isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
      title={isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : (isActive ? "ON" : "OFF")}
    </button>
  );
}
