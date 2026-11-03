"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { PopupEditor } from "@/components/admin/PopupEditor";

interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface Props {
  article?: Article;
  categories: ArticleCategory[];
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ article, categories: initialCategories }: Props) {
  const router = useRouter();
  const isEdit = !!article;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    coverImage: article?.coverImage ?? "",
    status: article?.status ?? "DRAFT",
    categoryId: article?.categoryId ?? "",
    metaTitle: article?.metaTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
  });

  const [categories, setCategories] = useState(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: isEdit ? f.slug : toSlug(title),
    }));
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "beeflower/articles");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload gagal");
      const { url } = await res.json();
      setForm((f) => ({ ...f, coverImage: url }));
    } catch {
      alert("Gagal upload gambar cover.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setAddingCat(true);
    try {
      const res = await fetch("/api/artikel-kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Gagal");
      const cat = await res.json();
      setCategories((c) => [...c, cat]);
      setForm((f) => ({ ...f, categoryId: cat.id }));
      setNewCatName("");
      setShowNewCat(false);
    } catch {
      alert("Gagal menambah kategori.");
    } finally {
      setAddingCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = isEdit ? `/api/artikel/${article.id}` : "/api/artikel";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan artikel");
      router.push("/admin/artikel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Slug */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Judul artikel..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">/blog/</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="slug-artikel"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan / Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Deskripsi singkat artikel yang tampil di listing..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>
          </div>

          {/* Content editor */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">Isi Artikel</label>
            <PopupEditor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              uploadFolder="beeflower/articles"
              minHeight="450px"
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">SEO Meta</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meta Title</label>
              <input
                value={form.metaTitle}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                placeholder="Judul untuk mesin pencari (biarkan kosong = pakai judul artikel)..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                placeholder="Deskripsi untuk mesin pencari..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-5">
          {/* Status & save */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Status Publikasi</h3>
            <div className="flex gap-2">
              {[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s.value }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.status === s.value
                      ? s.value === "PUBLISHED"
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-white"
                      : "border border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/admin/artikel")}
                disabled={loading}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Gambar Cover</h3>
            {form.coverImage ? (
              <div className="relative">
                <img
                  src={form.coverImage}
                  alt="Cover"
                  className="w-full h-36 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  className="absolute top-1.5 right-1.5 bg-white rounded-full p-1 shadow border border-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-brand-gold hover:text-brand-gold disabled:opacity-50 transition-colors"
              >
                {uploadingCover ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload Cover</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverUpload(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Kategori</h3>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white text-gray-700"
            >
              <option value="">— Tanpa Kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {showNewCat ? (
              <div className="space-y-2">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nama kategori baru..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); }
                  }}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCat || !newCatName.trim()}
                    className="flex-1 py-1.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown disabled:opacity-50 transition-colors"
                  >
                    {addingCat ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Tambah"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCat(false); setNewCatName(""); }}
                    className="flex-1 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCat(true)}
                className="flex items-center gap-1.5 text-xs text-brand-gold hover:text-brand-brown transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kategori Baru
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
