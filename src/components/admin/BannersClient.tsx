"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface Banner {
  id: string;
  image: string;
  headline: string | null;
  subheadline: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  isActive: boolean;
}

type FormState = Omit<Banner, "id" | "order" | "isActive"> & {
  isActive: boolean;
};

const emptyForm: FormState = {
  image: "",
  headline: "",
  subheadline: "",
  buttonText: "",
  buttonLink: "",
  isActive: true,
};

export function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [editing, setEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setIsAdding(true);
  };

  const openEdit = (banner: Banner) => {
    setForm({
      image: banner.image,
      headline: banner.headline ?? "",
      subheadline: banner.subheadline ?? "",
      buttonText: banner.buttonText ?? "",
      buttonLink: banner.buttonLink ?? "",
      isActive: banner.isActive,
    });
    setEditing(banner.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdding) {
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, order: banners.length }),
        });
        const newBanner = await res.json();
        setBanners([...banners, newBanner]);
        setIsAdding(false);
      } else if (editing) {
        const res = await fetch(`/api/banners/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setBanners(banners.map((b) => (b.id === editing ? updated : b)));
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    setBanners(banners.filter((b) => b.id !== id));
  };

  const toggleActive = async (banner: Banner) => {
    const res = await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    const updated = await res.json();
    setBanners(banners.map((b) => (b.id === banner.id ? updated : b)));
  };

  const isFormOpen = isAdding || editing !== null;

  return (
    <div className="space-y-4">
      <button
        onClick={openAdd}
        className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tambah Banner
      </button>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">
            {isAdding ? "Tambah Banner Baru" : "Edit Banner"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Banner
            </label>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              folder="beeflower/banners"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              value={form.headline ?? ""}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="Judul hero banner"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subheadline
            </label>
            <textarea
              value={form.subheadline ?? ""}
              onChange={(e) => setForm({ ...form, subheadline: e.target.value })}
              rows={2}
              placeholder="Deskripsi singkat"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                value={form.buttonText ?? ""}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                placeholder="BELANJA SEKARANG"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                value={form.buttonLink ?? ""}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                placeholder="/toko"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300 text-brand-gold"
              />
              <span className="text-sm text-gray-700">Aktif</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.image}
              className="px-5 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={() => { setIsAdding(false); setEditing(null); }}
              className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {banners.length === 0 && (
          <p className="text-center text-gray-400 py-10">Belum ada banner</p>
        )}
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
            <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-brand-cream flex-shrink-0">
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.headline ?? ""}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {banner.headline || "(tanpa judul)"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {banner.buttonLink || ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(banner)}
                className={`p-1.5 rounded-lg transition-colors ${
                  banner.isActive
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
                title={banner.isActive ? "Nonaktifkan" : "Aktifkan"}
              >
                {banner.isActive ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => openEdit(banner)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
