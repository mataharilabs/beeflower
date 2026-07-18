"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setAdding(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
    });
    setNewName("");
    setNewSlug("");
    setAdding(false);
    load();
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim() || !editSlug.trim()) return;
    setSaving(true);
    await fetch(`/api/categories/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() }),
    });
    setEditId(null);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini? Produk yang terhubung tidak akan terhapus.")) return;
    setDeletingId(id);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
        <span className="text-sm text-gray-400">{categories.length} kategori</span>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Tambah Kategori Baru</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNewSlug(slugify(e.target.value));
              }}
              placeholder="Nama kategori"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold mb-2"
            />
            <input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug-kategori"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-brand-gold"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim() || !newSlug.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50 self-start"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Belum ada kategori. Tambahkan kategori di atas.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  {editId === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setEditSlug(slugify(e.target.value));
                          }}
                          className="w-full px-2 py-1 border border-brand-gold rounded text-sm focus:outline-none"
                          autoFocus
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:border-brand-gold"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="w-7 h-7 flex items-center justify-center rounded text-green-600 hover:bg-green-50 transition-colors"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-brand-gold hover:bg-brand-cream transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Menghapus kategori tidak menghapus produk di dalamnya — produk hanya kehilangan kategorinya.
      </p>
    </div>
  );
}
