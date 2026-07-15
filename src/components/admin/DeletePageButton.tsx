"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Hapus &quot;{title}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? "..." : "Ya"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Batal
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-400 hover:text-red-500 transition-colors ml-3"
      title="Hapus halaman"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
