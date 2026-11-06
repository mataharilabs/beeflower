"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/pages/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-red-500 transition-colors ml-3"
        title="Hapus halaman"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Halaman?"
        description={`Halaman "${title}" akan dihapus permanen.`}
        loading={loading}
      />
    </>
  );
}
