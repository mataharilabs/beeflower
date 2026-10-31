"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

type ActionType = "archive" | "unarchive" | "soft-delete" | "restore" | "permanent-delete" | "duplicate";
type Tab = "all" | "archive" | "trash";

interface ActionConfig {
  title: string;
  description: (name: string, sku: string | null) => string;
  confirmLabel: string;
  confirmClass: string;
  danger?: boolean;
}

const ACTIONS: Record<ActionType, ActionConfig> = {
  archive: {
    title: "Arsipkan Produk?",
    description: (name) =>
      `Produk "${name}" akan disembunyikan dari toko dan dipindahkan ke Archive. Anda dapat mengembalikannya kapan saja.`,
    confirmLabel: "Ya, Arsipkan",
    confirmClass: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  unarchive: {
    title: "Kembalikan dari Archive?",
    description: (name) =>
      `Produk "${name}" akan dikembalikan ke daftar aktif dan tayang kembali di toko.`,
    confirmLabel: "Ya, Kembalikan",
    confirmClass: "bg-brand-gold hover:bg-brand-brown text-white",
  },
  "soft-delete": {
    title: "Hapus ke Trash?",
    description: (name) =>
      `Produk "${name}" akan dipindahkan ke Trash dan tidak tayang di toko. Anda masih bisa memulihkannya dari tab Trash.`,
    confirmLabel: "Ya, Hapus",
    confirmClass: "bg-red-500 hover:bg-red-600 text-white",
    danger: true,
  },
  restore: {
    title: "Pulihkan Produk?",
    description: (name) =>
      `Produk "${name}" akan dipulihkan ke daftar aktif dan tayang kembali di toko.`,
    confirmLabel: "Ya, Pulihkan",
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  "permanent-delete": {
    title: "Hapus Permanen?",
    description: (name) =>
      `Produk "${name}" akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.`,
    confirmLabel: "Ya, Hapus Permanen",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
    danger: true,
  },
  duplicate: {
    title: "Duplikat Produk?",
    description: (name, sku) =>
      `Akan dibuat salinan produk dengan nama "Copy-${name}"${sku ? ` dan SKU "Copy-${sku}"` : ""}. Duplikat dimulai sebagai produk nonaktif.`,
    confirmLabel: "Ya, Duplikat",
    confirmClass: "bg-blue-500 hover:bg-blue-600 text-white",
  },
};

interface Props {
  id: string;
  name: string;
  sku: string | null;
  tab: Tab;
}

export function ProductActions({ id, name, sku, tab }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async (action: ActionType) => {
    setLoading(true);
    try {
      let res: Response;
      if (action === "archive" || action === "unarchive" || action === "restore") {
        res = await fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      } else if (action === "soft-delete") {
        res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      } else if (action === "permanent-delete") {
        res = await fetch(`/api/products/${id}?permanent=true`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/products/${id}/duplicate`, { method: "POST" });
      }
      if (!res.ok) throw new Error();
      setPending(null);
      router.refresh();
    } catch {
      alert("Gagal melakukan aksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const link = "text-xs font-medium transition-colors cursor-pointer";

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {tab === "all" && (
          <>
            <Link href={`/admin/products/${id}`} className={`${link} text-brand-gold hover:text-brand-brown`}>Edit</Link>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={() => setPending("archive")} className={`${link} text-amber-500 hover:text-amber-700`}>Arsipkan</button>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={() => setPending("duplicate")} className={`${link} text-blue-500 hover:text-blue-700`}>Duplikat</button>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={() => setPending("soft-delete")} className={`${link} text-red-500 hover:text-red-700`}>Delete</button>
          </>
        )}
        {tab === "archive" && (
          <>
            <button type="button" onClick={() => setPending("unarchive")} className={`${link} text-brand-gold hover:text-brand-brown`}>Un-archive</button>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={() => setPending("soft-delete")} className={`${link} text-red-500 hover:text-red-700`}>Delete</button>
          </>
        )}
        {tab === "trash" && (
          <>
            <button type="button" onClick={() => setPending("restore")} className={`${link} text-green-600 hover:text-green-800`}>Restore</button>
            <span className="text-gray-200">|</span>
            <button type="button" onClick={() => setPending("permanent-delete")} className={`${link} text-red-600 hover:text-red-800`}>Hapus Permanen</button>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { if (!loading) setPending(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {ACTIONS[pending].danger && (
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            )}
            <h3 className="text-base font-semibold text-gray-900 text-center mb-2">
              {ACTIONS[pending].title}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              {ACTIONS[pending].description(name, sku)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => execute(pending)}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${ACTIONS[pending].confirmClass}`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Memproses..." : ACTIONS[pending].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
