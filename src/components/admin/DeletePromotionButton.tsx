"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

export function DeletePromotionButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
      >
        Hapus
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Promosi?"
        description={`Promosi "${name}" akan dihapus permanen.`}
        loading={loading}
      />
    </>
  );
}
