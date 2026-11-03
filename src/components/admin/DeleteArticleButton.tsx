"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  articleId: string;
  articleTitle: string;
  isTrash: boolean;
}

export function DeleteArticleButton({ articleId, articleTitle, isTrash }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const msg = isTrash
      ? `Hapus permanen artikel "${articleTitle}"?`
      : `Pindahkan artikel "${articleTitle}" ke sampah?`;
    if (!confirm(msg)) return;

    setLoading(true);
    try {
      await fetch(`/api/artikel/${articleId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={isTrash ? "Hapus Permanen" : "Pindah ke Sampah"}
      className={`p-1.5 rounded-lg transition-colors ${
        isTrash
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:bg-gray-100 hover:text-red-500"
      } disabled:opacity-50`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
