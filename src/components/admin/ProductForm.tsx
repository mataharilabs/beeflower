"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  price: { toString(): string };
  comparePrice?: { toString(): string } | null;
  stock: number;
  weight?: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  cartEnabled: boolean;
  cartButtonText: string | null;
  manualButtonEnabled: boolean;
  manualButtonText: string | null;
  manualButtonUrl: string | null;
}

interface Props {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    shortDesc: product?.shortDesc ?? "",
    price: product ? Number(product.price.toString()).toString() : "",
    comparePrice: product?.comparePrice ? Number(product.comparePrice.toString()).toString() : "",
    stock: product?.stock?.toString() ?? "0",
    weight: product?.weight?.toString() ?? "",
    images: product?.images ?? [] as string[],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    categoryId: product?.categoryId ?? "",
    metaTitle: product?.metaTitle ?? "",
    metaDescription: product?.metaDescription ?? "",
    ogImage: product?.ogImage ?? "",
    cartEnabled: product?.cartEnabled ?? true,
    cartButtonText: product?.cartButtonText ?? "",
    manualButtonEnabled: product?.manualButtonEnabled ?? false,
    manualButtonText: product?.manualButtonText ?? "",
    manualButtonUrl: product?.manualButtonUrl ?? "",
  });

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isEdit ? f.slug : slugify(name),
    }));
  };

  const addImage = (url: string) => {
    setForm((f) => ({ ...f, images: [...f.images, url] }));
  };

  const removeImage = (index: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
    }));
  };

  const setMainImage = (index: number) => {
    setForm((f) => {
      const imgs = [...f.images];
      const [main] = imgs.splice(index, 1);
      return { ...f, images: [main, ...imgs] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock),
        weight: form.weight ? parseInt(form.weight) : null,
        categoryId: form.categoryId || null,
      };

      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/products");
      router.refresh();
    } catch {
      alert("Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informasi Produk</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Coret (Rp)</label>
            <input
              type="number"
              value={form.comparePrice}
              onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Berat (gram)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              min="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            >
              <option value="">Tidak ada kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
            <input
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          {[
            { key: "isActive", label: "Aktif" },
            { key: "isFeatured", label: "Featured" },
            { key: "isBestSeller", label: "Best Seller" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="rounded border-gray-300 text-brand-gold"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Gambar Produk</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative group">
              <div className={`aspect-square rounded-lg overflow-hidden bg-gray-100 ${i === 0 ? "ring-2 ring-brand-gold" : ""}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-brand-gold text-white text-[10px] px-1.5 py-0.5 rounded font-semibold pointer-events-none">
                  Utama
                </span>
              )}
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => setMainImage(i)}
                  className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Jadikan Utama
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {form.images.length < 6 && (
            <div className="aspect-square">
              <ImageUploader
                value=""
                onChange={addImage}
                folder="beeflower/products"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Tombol Aksi Produk</h2>
          <p className="text-xs text-gray-400 mt-0.5">Pilih tombol yang tampil di halaman detail produk. Bisa pilih satu atau keduanya.</p>
        </div>

        {/* Cart button toggle */}
        <div className={`border rounded-xl p-4 transition-colors ${form.cartEnabled ? "border-brand-gold bg-brand-gold/5" : "border-gray-200"}`}>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <p className="font-medium text-sm text-gray-900">Keranjang (Add to Cart)</p>
              <p className="text-xs text-gray-400 mt-0.5">Tombol untuk menambahkan produk ke keranjang belanja</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, cartEnabled: !f.cartEnabled }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.cartEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.cartEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </label>
          {form.cartEnabled && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol <span className="text-gray-400 font-normal">(kosongkan untuk pakai default)</span></label>
              <input
                value={form.cartButtonText}
                onChange={(e) => setForm({ ...form, cartButtonText: e.target.value })}
                placeholder="Tambah ke Keranjang"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          )}
        </div>

        {/* Manual button toggle */}
        <div className={`border rounded-xl p-4 transition-colors ${form.manualButtonEnabled ? "border-brand-gold bg-brand-gold/5" : "border-gray-200"}`}>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <p className="font-medium text-sm text-gray-900">Tombol Custom (Link ke URL)</p>
              <p className="text-xs text-gray-400 mt-0.5">Tombol tambahan dengan teks & URL yang bisa diatur sendiri</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, manualButtonEnabled: !f.manualButtonEnabled }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.manualButtonEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.manualButtonEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </label>
          {form.manualButtonEnabled && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teks Tombol</label>
                <input
                  value={form.manualButtonText}
                  onChange={(e) => setForm({ ...form, manualButtonText: e.target.value })}
                  placeholder="Contoh: Beli via WhatsApp"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL Tujuan</label>
                <input
                  value={form.manualButtonUrl}
                  onChange={(e) => setForm({ ...form, manualButtonUrl: e.target.value })}
                  placeholder="https://wa.me/628xxx atau URL lain"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">SEO & Meta</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
          <input
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            placeholder="Judul untuk mesin pencari (max 60 karakter)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            rows={2}
            placeholder="Deskripsi untuk mesin pencari (max 160 karakter)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
          <input
            value={form.ogImage}
            onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
            placeholder="URL gambar untuk social media share"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? "Menyimpan..." : isEdit ? "Update Produk" : "Simpan Produk"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
