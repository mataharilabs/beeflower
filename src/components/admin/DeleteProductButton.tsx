"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-500 hover:text-red-700 text-xs font-medium"
      >
        Hapus
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Produk?"
        description={`Produk "${name}" akan dihapus permanen.`}
        loading={loading}
      />
    </>
  );
}
