"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface CouponData {
  id: string;
  title: string;
  description: string | null;
  code: string;
  imageUrl: string | null;
  discountType: string;
  discountMode: string;
  discountValue: { toString(): string };
  isLifetime: boolean;
  startAt: Date | null;
  endAt: Date | null;
  isUnlimited: boolean;
  quota: number | null;
  applicableProductIds: string[];
  applicableCities: string[];
}

interface Props {
  coupon?: CouponData | null;
  products: Product[];
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}`;
}

export function CouponForm({ coupon, products }: Props) {
  const router = useRouter();
  const isEdit = !!coupon;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(coupon?.title ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [code, setCode] = useState(coupon?.code ?? "");
  const [imageUrl, setImageUrl] = useState(coupon?.imageUrl ?? "");
  const [discountType, setDiscountType] = useState(coupon?.discountType ?? "PRODUCT");
  const [discountMode, setDiscountMode] = useState(coupon?.discountMode ?? "FIXED");
  const [discountValue, setDiscountValue] = useState(coupon ? Number(coupon.discountValue.toString()) : 0);
  const [isLifetime, setIsLifetime] = useState(coupon?.isLifetime ?? true);
  const [startAt, setStartAt] = useState(coupon?.startAt ? new Date(coupon.startAt).toISOString().slice(0, 16) : "");
  const [endAt, setEndAt] = useState(coupon?.endAt ? new Date(coupon.endAt).toISOString().slice(0, 16) : "");
  const [isUnlimited, setIsUnlimited] = useState(coupon?.isUnlimited ?? true);
  const [quota, setQuota] = useState(coupon?.quota ?? 1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(coupon?.applicableProductIds ?? []);
  const [allProducts, setAllProducts] = useState((coupon?.applicableProductIds ?? []).length === 0);
  const [cityInput, setCityInput] = useState("");
  const [cities, setCities] = useState<string[]>(coupon?.applicableCities ?? []);
  const [allCities, setAllCities] = useState((coupon?.applicableCities ?? []).length === 0);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addCity = () => {
    const val = cityInput.trim();
    if (val && !cities.includes(val)) {
      setCities([...cities, val]);
    }
    setCityInput("");
  };

  const removeCity = (city: string) => setCities(cities.filter((c) => c !== city));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !code) {
      setError("Judul dan kode kupon wajib diisi");
      return;
    }
    if (discountValue <= 0) {
      setError("Nilai diskon harus lebih dari 0");
      return;
    }
    if (discountMode === "PERCENTAGE" && discountValue > 100) {
      setError("Persentase diskon tidak boleh lebih dari 100%");
      return;
    }
    if (!isLifetime && (!startAt || !endAt)) {
      setError("Tanggal mulai dan berakhir wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title,
        description: description || null,
        code: code.toUpperCase(),
        imageUrl: imageUrl || null,
        discountType,
        discountMode,
        discountValue,
        isLifetime,
        startAt: isLifetime ? null : startAt,
        endAt: isLifetime ? null : endAt,
        isUnlimited,
        quota: isUnlimited ? null : quota,
        applicableProductIds: allProducts ? [] : selectedProductIds,
        applicableCities: allCities ? [] : cities,
      };

      const url = isEdit ? `/api/coupons/${coupon.id}` : "/api/coupons";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan");
        return;
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1.5";
  const sectionClass = "bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Informasi Dasar</h2>
        <div>
          <label className={labelClass}>Judul Kupon *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Contoh: Diskon Pelanggan Baru" />
        </div>
        <div>
          <label className={labelClass}>Kode Kupon *</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className={`${inputClass} flex-1 font-mono`}
              placeholder="CONTOH-KODE"
            />
            <button
              type="button"
              onClick={() => setCode(generateCode())}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:text-brand-brown hover:border-brand-gold transition-colors"
              title="Generate kode acak"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Deskripsi kupon (opsional)" />
        </div>
        <div>
          <label className={labelClass}>URL Gambar (opsional)</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputClass} placeholder="https://..." type="url" />
        </div>
      </div>

      {/* Discount Config */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Konfigurasi Diskon</h2>
        <div>
          <label className={labelClass}>Tipe Diskon</label>
          <div className="flex gap-3">
            {[{ val: "PRODUCT", label: "Potongan Produk" }, { val: "SHIPPING", label: "Potongan Ongkir" }].map(({ val, label }) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="discountType" value={val} checked={discountType === val} onChange={() => setDiscountType(val)} className="text-brand-gold" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Mode Diskon</label>
          <div className="flex gap-3">
            {[{ val: "FIXED", label: "Nominal (Rp)" }, { val: "PERCENTAGE", label: "Persentase (%)" }].map(({ val, label }) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="discountMode" value={val} checked={discountMode === val} onChange={() => setDiscountMode(val)} className="text-brand-gold" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>
            Nilai Diskon {discountMode === "FIXED" ? "(Rp)" : "(%)"}
          </label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            min={0}
            max={discountMode === "PERCENTAGE" ? 100 : undefined}
            required
            className={inputClass}
            placeholder={discountMode === "FIXED" ? "10000" : "10"}
          />
        </div>
      </div>

      {/* Validity */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Validitas</h2>
        <div className="flex gap-3">
          {[{ val: true, label: "Seumur Hidup" }, { val: false, label: "Jadwal Tertentu" }].map(({ val, label }) => (
            <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="validity" checked={isLifetime === val} onChange={() => setIsLifetime(val)} className="text-brand-gold" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {!isLifetime && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tanggal Mulai</label>
              <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required={!isLifetime} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tanggal Berakhir</label>
              <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required={!isLifetime} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {/* Quota */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Kuota</h2>
        <div className="flex gap-3">
          {[{ val: true, label: "Unlimited" }, { val: false, label: "Terbatas" }].map(({ val, label }) => (
            <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="quota" checked={isUnlimited === val} onChange={() => setIsUnlimited(val)} className="text-brand-gold" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {!isUnlimited && (
          <div>
            <label className={labelClass}>Jumlah Kuota</label>
            <input type="number" value={quota} onChange={(e) => setQuota(Number(e.target.value))} min={1} required={!isUnlimited} className={inputClass} />
          </div>
        )}
      </div>

      {/* Product Condition */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Kondisi Produk</h2>
        <div className="flex gap-3 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allProducts} onChange={(e) => setAllProducts(e.target.checked)} className="text-brand-gold" />
            <span className="text-sm text-gray-700">Berlaku untuk semua produk</span>
          </label>
        </div>
        {!allProducts && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="text-brand-gold"
                />
                <span className="text-sm text-gray-700">{p.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* City Condition */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Kondisi Kota</h2>
        <div className="flex gap-3 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allCities} onChange={(e) => setAllCities(e.target.checked)} className="text-brand-gold" />
            <span className="text-sm text-gray-700">Berlaku untuk semua kota</span>
          </label>
        </div>
        {!allCities && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCity(); } }}
                className={`${inputClass} flex-1`}
                placeholder="Nama kota, tekan Enter untuk tambah"
              />
              <button type="button" onClick={addCity} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                Tambah
              </button>
            </div>
            {cities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <span key={city} className="flex items-center gap-1 px-2.5 py-1 bg-brand-cream text-brand-brown text-xs rounded-full">
                    {city}
                    <button type="button" onClick={() => removeCity(city)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Kupon"}
        </button>
      </div>
    </form>
  );
}
