"use client";

import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 text-xs font-medium"
    >
      Hapus
    </button>
  );
}
