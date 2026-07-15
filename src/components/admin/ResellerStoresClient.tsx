"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Store, MapPin, Phone } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung",
  "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

type ResellerStore = {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  shopee: string | null;
  tokopedia: string | null;
  province: string;
  city: string;
  isActive: boolean;
  order: number;
};

const EMPTY_FORM: Omit<ResellerStore, "id"> = {
  name: "",
  logoUrl: null,
  address: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  shopee: "",
  tokopedia: "",
  province: "Jawa Timur",
  city: "",
  isActive: true,
  order: 0,
};

export function ResellerStoresClient() {
  const [stores, setStores] = useState<ResellerStore[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ResellerStore, "id">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadStores() {
    setLoading(true);
    const res = await fetch("/api/reseller-stores");
    const data = await res.json();
    setStores(data);
    setLoading(false);
  }

  useEffect(() => { loadStores(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(store: ResellerStore) {
    setEditingId(store.id);
    setForm({
      name: store.name,
      logoUrl: store.logoUrl,
      address: store.address ?? "",
      phone: store.phone ?? "",
      whatsapp: store.whatsapp ?? "",
      instagram: store.instagram ?? "",
      tiktok: store.tiktok ?? "",
      shopee: store.shopee ?? "",
      tokopedia: store.tokopedia ?? "",
      province: store.province,
      city: store.city,
      isActive: store.isActive,
      order: store.order,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.province || !form.city.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      logoUrl: form.logoUrl || null,
      address: form.address || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      tiktok: form.tiktok || null,
      shopee: form.shopee || null,
      tokopedia: form.tokopedia || null,
    };
    if (editingId) {
      await fetch(`/api/reseller-stores/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/reseller-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowModal(false);
    loadStores();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reseller-stores/${id}`, { method: "DELETE" });
    setDeletingId(null);
    loadStores();
  }

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.province.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Toko Reseller</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Toko
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama toko, provinsi, atau kota..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Toko</th>
              <th className="text-left px-4 py-3 font-medium">Lokasi</th>
              <th className="text-left px-4 py-3 font-medium">Kontak</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Belum ada toko reseller
                </td>
              </tr>
            )}
            {filtered.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-brand-gold" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-400">Urutan: {store.order}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{store.city}, {store.province}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {store.phone && (
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                      <Phone className="w-3 h-3" />
                      {store.phone}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      store.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {store.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(store)}
                      className="text-brand-gold hover:text-brand-brown transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deletingId === store.id ? (
                      <span className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Batal
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeletingId(store.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Toko" : "Tambah Toko Reseller"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Toko</label>
                <ImageUploader
                  value={form.logoUrl ?? ""}
                  onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
                  folder="beeflower/reseller-stores"
                />
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Toko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="Nama toko reseller"
                />
              </div>

              {/* Provinsi & Kota */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota / Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="Nama kota"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={form.address ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none"
                  placeholder="Alamat lengkap toko"
                />
              </div>

              {/* Telepon & WhatsApp */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    value={form.phone ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={form.whatsapp ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    placeholder="628xx-xxxx-xxxx"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Sosial Media</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "instagram", label: "Instagram (username)" },
                    { key: "tiktok", label: "TikTok (username)" },
                    { key: "shopee", label: "Shopee (username)" },
                    { key: "tokopedia", label: "Tokopedia (username)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(form as Record<string, unknown>)[key] as string ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                        placeholder={key}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-brand-gold"
                    />
                    <span className="text-sm text-gray-700">Aktif (tampil di website)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.city.trim()}
                className="px-4 py-2 text-sm bg-brand-gold text-white rounded-lg font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Toko"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
