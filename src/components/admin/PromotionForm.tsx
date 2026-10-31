"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Search, Tag, ShoppingCart, Gift, Truck } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PromotionType = "PRODUCT_DISCOUNT" | "ORDER_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING";
type DiscountMode = "PERCENTAGE" | "FIXED";

interface SelectedProduct { id: string; name: string; }
interface Category { id: string; name: string; }

interface PromotionData {
  id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  isActive: boolean;
  startAt: string | Date;
  endAt: string | Date;
  discountMode: DiscountMode | null;
  discountValue: { toString(): string } | null;
  minimumPurchase: { toString(): string } | null;
  applyToAll: boolean;
  applicableProductIds: string[];
  applicableProductNames: string[];
  applicableCategoryIds: string[];
  buyProductId: string | null;
  buyProductName: string | null;
  buyQuantity: number | null;
  getProductId: string | null;
  getProductName: string | null;
  getQuantity: number | null;
  getDiscountMode: DiscountMode | null;
  getDiscountValue: { toString(): string } | null;
  applicableCities: string[];
}

interface Props {
  promotion?: PromotionData;
  categories: Category[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(dt: string | Date | null | undefined): string {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toISOString().slice(0, 16);
}

const TYPE_CONFIG = {
  PRODUCT_DISCOUNT: {
    label: "Potongan Harga Produk",
    icon: Tag,
    desc: "Diskon untuk produk atau koleksi tertentu",
    color: "border-amber-300 bg-amber-50 text-amber-700",
    activeColor: "border-amber-500 bg-amber-100 ring-amber-400",
  },
  ORDER_DISCOUNT: {
    label: "Potongan Total Pesanan",
    icon: ShoppingCart,
    desc: "Diskon langsung dari subtotal keranjang",
    color: "border-blue-300 bg-blue-50 text-blue-700",
    activeColor: "border-blue-500 bg-blue-100 ring-blue-400",
  },
  BUY_X_GET_Y: {
    label: "Beli X Dapat Y",
    icon: Gift,
    desc: "Beli sejumlah produk, gratis/diskon produk lain",
    color: "border-green-300 bg-green-50 text-green-700",
    activeColor: "border-green-500 bg-green-100 ring-green-400",
  },
  FREE_SHIPPING: {
    label: "Gratis Ongkir",
    icon: Truck,
    desc: "Hapus biaya kirim dengan syarat tertentu",
    color: "border-cyan-300 bg-cyan-50 text-cyan-700",
    activeColor: "border-cyan-500 bg-cyan-100 ring-cyan-400",
  },
} as const;

// ─── ProductPicker ────────────────────────────────────────────────────────────

function ProductPicker({
  label,
  selected,
  onAdd,
  onRemove,
  multiple = false,
  placeholder = "Cari produk...",
}: {
  label: string;
  selected: SelectedProduct[];
  onAdd: (p: SelectedProduct) => void;
  onRemove: (id: string) => void;
  multiple?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&take=10`);
        const data = await res.json();
        setResults((data.products ?? []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        setOpen(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const canAdd = multiple || selected.length === 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-cream text-brand-brown text-xs rounded-full font-medium">
              {p.name}
              <button type="button" onClick={() => onRemove(p.id)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {canAdd && (
        <div className="relative" ref={wrapRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          </div>
          {open && results.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {results.map((product) => {
                const alreadySel = selected.some((s) => s.id === product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={() => {
                      if (!alreadySel) { onAdd(product); setQuery(""); setOpen(false); }
                    }}
                    disabled={alreadySel}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${alreadySel ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {product.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CityTagInput ─────────────────────────────────────────────────────────────

function CityTagInput({ cities, onChange }: { cities: string[]; onChange: (c: string[]) => void }) {
  const [input, setInput] = useState("");

  const addCity = () => {
    const val = input.trim();
    if (!val || cities.includes(val)) return;
    onChange([...cities, val]);
    setInput("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {cities.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full font-medium">
            {c}
            <button type="button" onClick={() => onChange(cities.filter((x) => x !== c))} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCity(); } }}
          placeholder="Nama kota, tekan Enter..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
        />
        <button type="button" onClick={addCity} className="px-3 py-2 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── PromotionForm ────────────────────────────────────────────────────────────

export function PromotionForm({ promotion, categories }: Props) {
  const router = useRouter();
  const isEdit = !!promotion;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: promotion?.name ?? "",
    description: promotion?.description ?? "",
    type: (promotion?.type ?? "ORDER_DISCOUNT") as PromotionType,
    isActive: promotion?.isActive ?? true,
    startAt: toDatetimeLocal(promotion?.startAt),
    endAt: toDatetimeLocal(promotion?.endAt),
    // Types 1 & 2
    discountMode: (promotion?.discountMode ?? "PERCENTAGE") as DiscountMode,
    discountValue: promotion?.discountValue ? Number(promotion.discountValue.toString()).toString() : "",
    minimumPurchase: promotion?.minimumPurchase ? Number(promotion.minimumPurchase.toString()).toString() : "",
    // Type 1
    applyToAll: promotion?.applyToAll ?? true,
    applicableProducts: (promotion?.applicableProductIds ?? []).map((id, i) => ({
      id,
      name: promotion?.applicableProductNames?.[i] ?? id,
    })) as SelectedProduct[],
    applicableCategoryIds: promotion?.applicableCategoryIds ?? [] as string[],
    // Type 3
    buyProduct: promotion?.buyProductId ? { id: promotion.buyProductId, name: promotion.buyProductName ?? "" } : null as SelectedProduct | null,
    buyQuantity: promotion?.buyQuantity?.toString() ?? "1",
    getProduct: promotion?.getProductId ? { id: promotion.getProductId, name: promotion.getProductName ?? "" } : null as SelectedProduct | null,
    getQuantity: promotion?.getQuantity?.toString() ?? "1",
    getIsFree: !promotion?.getDiscountMode,
    getDiscountMode: (promotion?.getDiscountMode ?? "PERCENTAGE") as DiscountMode,
    getDiscountValue: promotion?.getDiscountValue ? Number(promotion.getDiscountValue.toString()).toString() : "",
    // Type 4
    applicableCities: promotion?.applicableCities ?? [] as string[],
  });

  const set = (updates: Partial<typeof form>) => setForm((f) => ({ ...f, ...updates }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startAt || !form.endAt) { alert("Periode waktu wajib diisi"); return; }
    if (new Date(form.endAt) <= new Date(form.startAt)) { alert("Tanggal akhir harus setelah tanggal mulai"); return; }

    setSaving(true);
    try {
      const hasDiscount = form.type === "PRODUCT_DISCOUNT" || form.type === "ORDER_DISCOUNT";

      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        isActive: form.isActive,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        discountMode: hasDiscount ? form.discountMode : null,
        discountValue: hasDiscount && form.discountValue ? parseFloat(form.discountValue) : null,
        minimumPurchase: form.minimumPurchase ? parseFloat(form.minimumPurchase) : null,
        // Type 1
        applyToAll: form.type === "PRODUCT_DISCOUNT" ? form.applyToAll : true,
        applicableProductIds: form.type === "PRODUCT_DISCOUNT" && !form.applyToAll ? form.applicableProducts.map((p) => p.id) : [],
        applicableProductNames: form.type === "PRODUCT_DISCOUNT" && !form.applyToAll ? form.applicableProducts.map((p) => p.name) : [],
        applicableCategoryIds: form.type === "PRODUCT_DISCOUNT" && !form.applyToAll ? form.applicableCategoryIds : [],
        // Type 3
        buyProductId: form.type === "BUY_X_GET_Y" ? (form.buyProduct?.id ?? null) : null,
        buyProductName: form.type === "BUY_X_GET_Y" ? (form.buyProduct?.name ?? null) : null,
        buyQuantity: form.type === "BUY_X_GET_Y" ? parseInt(form.buyQuantity) : null,
        getProductId: form.type === "BUY_X_GET_Y" ? (form.getProduct?.id ?? null) : null,
        getProductName: form.type === "BUY_X_GET_Y" ? (form.getProduct?.name ?? null) : null,
        getQuantity: form.type === "BUY_X_GET_Y" ? parseInt(form.getQuantity) : null,
        getDiscountMode: form.type === "BUY_X_GET_Y" && !form.getIsFree ? form.getDiscountMode : null,
        getDiscountValue: form.type === "BUY_X_GET_Y" && !form.getIsFree && form.getDiscountValue ? parseFloat(form.getDiscountValue) : null,
        // Type 4
        applicableCities: form.type === "FREE_SHIPPING" ? form.applicableCities : [],
      };

      const url = isEdit ? `/api/promotions/${promotion.id}` : "/api/promotions";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Gagal menyimpan promosi");
        return;
      }
      router.push("/admin/promotions");
      router.refresh();
    } catch {
      alert("Gagal menyimpan promosi");
    } finally {
      setSaving(false);
    }
  };

  const cfg = TYPE_CONFIG[form.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* Type selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Tipe Promosi</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(TYPE_CONFIG) as [PromotionType, typeof TYPE_CONFIG[PromotionType]][]).map(([type, config]) => {
            const Icon = config.icon;
            const isSelected = form.type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => set({ type })}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `${config.activeColor} ring-2 ring-offset-1`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`mt-0.5 p-1.5 rounded-lg ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>{config.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{config.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Informasi Promosi</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promosi <span className="text-red-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            required
            placeholder={`Contoh: Diskon ${cfg.label} Spesial`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
          <textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            placeholder="Keterangan singkat tentang promosi ini..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Berlaku <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => set({ startAt: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Berakhir <span className="text-red-500">*</span></label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => set({ endAt: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => set({ isActive: !form.isActive })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${form.isActive ? "bg-brand-gold" : "bg-gray-200"}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">Aktifkan Promosi</span>
        </label>
      </div>

      {/* Type-specific settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-5">
        <h2 className="font-semibold text-gray-900">Pengaturan {cfg.label}</h2>

        {/* ── Types 1 & 2: discount fields ── */}
        {(form.type === "PRODUCT_DISCOUNT" || form.type === "ORDER_DISCOUNT") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bentuk Potongan <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {(["PERCENTAGE", "FIXED"] as DiscountMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set({ discountMode: mode })}
                    className={`flex-1 py-2 px-3 text-sm border-2 rounded-lg font-medium transition-colors ${
                      form.discountMode === mode
                        ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {mode === "PERCENTAGE" ? "Persentase (%)" : "Nominal Tetap (Rp)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai Potongan {form.discountMode === "PERCENTAGE" ? "(%)" : "(Rp)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => set({ discountValue: e.target.value })}
                  required
                  min="0"
                  max={form.discountMode === "PERCENTAGE" ? 100 : undefined}
                  placeholder={form.discountMode === "PERCENTAGE" ? "Contoh: 20" : "Contoh: 50000"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Belanja (Rp) <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="number"
                  value={form.minimumPurchase}
                  onChange={(e) => set({ minimumPurchase: e.target.value })}
                  min="0"
                  placeholder="Kosongkan = tanpa batas"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>
          </>
        )}

        {/* ── Type 1: product scope ── */}
        {form.type === "PRODUCT_DISCOUNT" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Berlaku Untuk</label>
            <div className="space-y-2">
              {[
                { val: true,  label: "Semua Produk", sub: "Berlaku untuk seluruh katalog" },
                { val: false, label: "Produk / Kategori Tertentu", sub: "Pilih produk atau kategori spesifik" },
              ].map(({ val, label, sub }) => (
                <label key={String(val)} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${form.applyToAll === val ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input
                    type="radio"
                    checked={form.applyToAll === val}
                    onChange={() => set({ applyToAll: val })}
                    className="mt-0.5 text-brand-gold"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                </label>
              ))}
            </div>

            {!form.applyToAll && (
              <div className="space-y-4 pl-2 border-l-2 border-brand-gold/20">
                <ProductPicker
                  label="Produk Spesifik"
                  selected={form.applicableProducts}
                  onAdd={(p) => set({ applicableProducts: [...form.applicableProducts, p] })}
                  onRemove={(id) => set({ applicableProducts: form.applicableProducts.filter((x) => x.id !== id) })}
                  multiple
                  placeholder="Cari dan tambah produk..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const selected = form.applicableCategoryIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            set({
                              applicableCategoryIds: selected
                                ? form.applicableCategoryIds.filter((id) => id !== cat.id)
                                : [...form.applicableCategoryIds, cat.id],
                            })
                          }
                          className={`px-3 py-1 text-xs border-2 rounded-full font-medium transition-colors ${
                            selected
                              ? "border-brand-gold bg-brand-gold text-white"
                              : "border-gray-200 text-gray-600 hover:border-brand-gold/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                    {categories.length === 0 && <p className="text-xs text-gray-400">Belum ada kategori</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Type 3: Buy X Get Y ── */}
        {form.type === "BUY_X_GET_Y" && (
          <div className="space-y-5">
            {/* Buy side */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
              <p className="text-sm font-semibold text-blue-700">Produk yang Dibeli (X)</p>
              <ProductPicker
                label="Produk Beli"
                selected={form.buyProduct ? [form.buyProduct] : []}
                onAdd={(p) => set({ buyProduct: p })}
                onRemove={() => set({ buyProduct: null })}
                placeholder="Cari produk yang harus dibeli..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pembelian Minimum</label>
                <input
                  type="number"
                  value={form.buyQuantity}
                  onChange={(e) => set({ buyQuantity: e.target.value })}
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Get side */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-3">
              <p className="text-sm font-semibold text-green-700">Produk yang Didapat (Y)</p>
              <ProductPicker
                label="Produk Hadiah"
                selected={form.getProduct ? [form.getProduct] : []}
                onAdd={(p) => set({ getProduct: p })}
                onRemove={() => set({ getProduct: null })}
                placeholder="Cari produk yang akan diberikan..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Produk Y</label>
                <input
                  type="number"
                  value={form.getQuantity}
                  onChange={(e) => set({ getQuantity: e.target.value })}
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diskon untuk Produk Y</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: true,  mode: null as null,          label: "Gratis (100%)" },
                    { val: false, mode: "PERCENTAGE" as const, label: "Diskon %" },
                    { val: false, mode: "FIXED" as const,      label: "Diskon Rp" },
                  ].map(({ val, mode, label }) => {
                    const active = form.getIsFree === val && (val || form.getDiscountMode === mode);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => set({ getIsFree: val, getDiscountMode: mode ?? "PERCENTAGE" })}
                        className={`px-3 py-1.5 text-xs border-2 rounded-lg font-medium transition-colors ${
                          active ? "border-green-500 bg-green-100 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {!form.getIsFree && (
                  <input
                    type="number"
                    value={form.getDiscountValue}
                    onChange={(e) => set({ getDiscountValue: e.target.value })}
                    min="0"
                    max={form.getDiscountMode === "PERCENTAGE" ? 100 : undefined}
                    placeholder={form.getDiscountMode === "PERCENTAGE" ? "Contoh: 50" : "Contoh: 25000"}
                    className="mt-2 w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Type 4: Free Shipping ── */}
        {form.type === "FREE_SHIPPING" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Belanja (Rp) <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="number"
                value={form.minimumPurchase}
                onChange={(e) => set({ minimumPurchase: e.target.value })}
                min="0"
                placeholder="Kosongkan = tanpa minimum belanja"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batasi ke Kota Tertentu <span className="text-gray-400 font-normal">(opsional, kosongkan = semua kota)</span>
              </label>
              <CityTagInput cities={form.applicableCities} onChange={(c) => set({ applicableCities: c })} />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Menyimpan..." : isEdit ? "Update Promosi" : "Simpan Promosi"}
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
