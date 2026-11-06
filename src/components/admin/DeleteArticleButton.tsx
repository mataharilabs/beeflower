"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface Props {
  articleId: string;
  articleTitle: string;
  isTrash: boolean;
}

export function DeleteArticleButton({ articleId, articleTitle, isTrash }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/artikel/${articleId}`, { method: "DELETE" });
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
        disabled={loading}
        title={isTrash ? "Hapus Permanen" : "Pindah ke Sampah"}
        className={`p-1.5 rounded-lg transition-colors ${
          isTrash
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-500 hover:bg-gray-100 hover:text-red-500"
        } disabled:opacity-50`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={isTrash ? "Hapus Permanen?" : "Pindahkan ke Sampah?"}
        description={
          isTrash
            ? `Artikel "${articleTitle}" akan dihapus permanen dan tidak bisa dikembalikan.`
            : `Artikel "${articleTitle}" akan dipindahkan ke sampah.`
        }
        confirmLabel={isTrash ? "Ya, Hapus Permanen" : "Ya, Pindahkan"}
        loading={loading}
      />
    </>
  );
}
