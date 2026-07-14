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
