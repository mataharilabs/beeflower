"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Globe, Trash2 } from "lucide-react";
import { DeletePageButton } from "@/components/admin/DeletePageButton";

type Page = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
};

const SYSTEM_SLUGS = ["home", "reseller", "contact", "toko", "toko-reseller"];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function PagesClient({
  pages,
  tokoResellerPageId,
}: {
  pages: Page[];
  tokoResellerPageId: string | null;
}) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [slugManual, setSlugManual] = useState(false);

  const systemPages = pages.filter(
    (p) => SYSTEM_SLUGS.includes(p.slug) && p.slug !== "toko-reseller"
  );
  const customPages = pages.filter((p) => !SYSTEM_SLUGS.includes(p.slug));
  const orderedPages = [...systemPages, ...customPages];

  const customIds = new Set(customPages.map((p) => p.id));
  const selectedCustomCount = [...selectedIds].filter((id) => customIds.has(id)).length;
  const allSelected = customPages.length > 0 && selectedCustomCount === customPages.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customPages.map((p) => p.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Hapus ${selectedIds.size} halaman yang dipilih? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBulkDeleting(true);
    await fetch("/api/pages/bulk-delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selectedIds] }),
    });
    setSelectedIds(new Set());
    setBulkDeleting(false);
    router.refresh();
  }

  function openAdd() {
    setForm({ title: "", slug: "", metaTitle: "", metaDescription: "" });
    setSlugManual(false);
    setCreateError(null);
    setShowAddModal(true);
  }

  function handleTitleChange(val: string) {
    setForm((f) => ({
      ...f,
      title: val,
      slug: slugManual ? f.slug : slugify(val),
    }));
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setForm((f) => ({ ...f, slug: val }));
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.slug.trim()) return;
    setCreating(true);
    setCreateError(null);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        slug: form.slug.trim(),
        craftJson: {},
        isPublished: false,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setCreateError(err?.error ?? "Gagal membuat halaman, slug mungkin sudah digunakan.");
      setCreating(false);
      return;
    }
    const page = await res.json();
    router.push(`/admin/pages/${page.id}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Halaman CMS</h1>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {bulkDeleting ? "Menghapus..." : `Hapus ${selectedIds.size} Terpilih`}
            </button>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Halaman
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={customPages.length === 0}
                  className="w-3.5 h-3.5 accent-brand-gold"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium">Judul</th>
              <th className="text-left px-4 py-3 font-medium">URL</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Diperbarui</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Hardcoded Toko Reseller system entry */}
            <tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
              <td className="px-4 py-3" />
              <td className="px-4 py-3 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Globe className="w-2.5 h-2.5" /> Sistem
                  </span>
                  Halaman Toko Reseller
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">/toko-reseller</td>
              <td className="px-4 py-3">
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Published
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">—</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {tokoResellerPageId && (
                    <Link
                      href={`/admin/pages/${tokoResellerPageId}`}
                      className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                    >
                      Edit
                    </Link>
                  )}
                  <Link
                    href="/admin/reseller-stores"
                    className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                  >
                    Kelola Toko
                  </Link>
                </div>
              </td>
            </tr>

            {orderedPages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  Belum ada halaman
                </td>
              </tr>
            )}

            {orderedPages.map((page) => {
              const isSystem = SYSTEM_SLUGS.includes(page.slug);
              const publicUrl =
                page.slug === "home" ? "/" : isSystem ? `/${page.slug}` : `/p/${page.slug}`;
              const isSelected = selectedIds.has(page.id);
              return (
                <tr
                  key={page.id}
                  className={`hover:bg-gray-50/50 transition-colors ${isSystem ? "bg-amber-50/30" : ""} ${isSelected ? "bg-brand-gold/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    {!isSystem && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(page.id)}
                        className="w-3.5 h-3.5 accent-brand-gold"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {isSystem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Globe className="w-2.5 h-2.5" /> Sistem
                        </span>
                      )}
                      {page.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{publicUrl}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        page.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(page.updatedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                      >
                        Edit
                      </Link>
                      {!isSystem && <DeletePageButton id={page.id} title={page.title} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Globe className="w-3 h-3" /> Sistem
        </span>{" "}
        = Halaman utama website yang dirender di URL tetap (/, /reseller, /contact). Perubahan
        langsung terlihat di website publik.
      </p>

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Tambah Halaman Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Halaman <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="Contoh: Tentang Kami"
                  autoFocus
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug URL <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-gold/30">
                  <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm font-mono border-r border-gray-200 flex-shrink-0">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none"
                    placeholder="tentang-kami"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  URL publik:{" "}
                  <span className="font-mono">beeflowerbrand.co.id/p/{form.slug || "slug"}</span>
                </p>
              </div>

              {/* SEO */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SEO (opsional)
                </p>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Judul yang muncul di hasil Google"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meta Description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Deskripsi singkat yang muncul di bawah judul di Google"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{createError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.title.trim() || !form.slug.trim()}
                className="px-4 py-2 text-sm bg-brand-gold text-white rounded-lg font-medium hover:bg-brand-brown disabled:opacity-50 transition-colors"
              >
                {creating ? "Membuat..." : "Buat & Edit Halaman →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
