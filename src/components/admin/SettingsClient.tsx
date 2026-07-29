"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface SiteSettings {
  id: string;
  siteName: string;
  logoUrl: string | null;
  logoWidth: number | null;
  logoLightUrl: string | null;
  logoLightWidth: number | null;
  faviconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  googleMapsEmbed: string | null;
  instagram: string | null;
  tiktok: string | null;
  shopee: string | null;
  tokopedia: string | null;
  storeProvinsiId: number | null;
  storeProvinsiName: string | null;
  storeKabupatenId: number | null;
  storeKabupatenName: string | null;
  storeKecamatanId: number | null;
  storeKecamatanName: string | null;
  storeKelurahanId: number | null;
  storeKelurahanName: string | null;
  storeRoProvinceId: number | null;
  storeRoProvinceName: string | null;
  storeRoCityId: number | null;
  storeRoCityName: string | null;
  storeRoDistrictId: number | null;
  storeRoDistrictName: string | null;
  maintenanceMode: boolean;
  facebookPixelId: string | null;
  headerScripts: string | null;
  footerScripts: string | null;
}

interface PaymentSettings {
  id: string;
  xenditEnabled: boolean;
  xenditSecretKey: string | null;
  manualTransferEnabled: boolean;
  qrisEnabled: boolean;
  qrisImageUrl: string | null;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  logoUrl: string | null;
  isActive: boolean;
  order: number;
}

interface ShippingSettingsData {
  id: string;
  kiriminajaEnabled: boolean;
  kiriminajaToken: string | null;
  couriers: string[];
  rajaongkirEnabled: boolean;
  rajaongkirApiKey: string | null;
  rajaongkirCouriers: string[];
  flatRateEnabled: boolean;
  flatRateAmount: string | number | null;
  flatRateLabel: string | null;
}

interface RegionItem { id: number; name: string }

interface Props {
  settings: SiteSettings;
  paymentSettings: PaymentSettings;
  bankAccounts: BankAccount[];
  shippingSettings: ShippingSettingsData | null;
}

const ALL_COURIERS = [
  { code: "jne", label: "JNE" },
  { code: "jnt", label: "J&T Express" },
  { code: "sicepat", label: "SiCepat" },
  { code: "anteraja", label: "Anteraja" },
  { code: "pos", label: "POS Indonesia" },
];

export function SettingsClient({ settings, paymentSettings, bankAccounts: initialBanks, shippingSettings: initialShipping }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "contact" | "marketing" | "store-location" | "shipping">("general");
  const [saving, setSaving] = useState(false);

  const [site, setSite] = useState(settings);
  const [payment, setPayment] = useState(paymentSettings);
  const [banks, setBanks] = useState(initialBanks);
  const [newBank, setNewBank] = useState({ bankName: "", accountHolder: "", accountNumber: "", logoUrl: "" });
  const [addingBank, setAddingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  // Shipping settings state
  const [shipping, setShipping] = useState<ShippingSettingsData>(initialShipping ?? {
    id: "singleton", kiriminajaEnabled: false, kiriminajaToken: null,
    couriers: ["jne", "jnt", "sicepat", "anteraja", "pos"],
    rajaongkirEnabled: false, rajaongkirApiKey: null,
    rajaongkirCouriers: ["jne", "jnt", "sicepat", "anteraja", "pos"],
    flatRateEnabled: false, flatRateAmount: null, flatRateLabel: null,
  });

  // Store location cascading dropdowns
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<RegionItem[]>([]);

  const [storeProvinsiId, setStoreProvinsiId] = useState<number | null>(settings.storeProvinsiId ?? null);
  const [storeProvinsiName, setStoreProvinsiName] = useState(settings.storeProvinsiName ?? "");
  const [storeKabupatenId, setStoreKabupatenId] = useState<number | null>(settings.storeKabupatenId ?? null);
  const [storeKabupatenName, setStoreKabupatenName] = useState(settings.storeKabupatenName ?? "");
  const [storeKecamatanId, setStoreKecamatanId] = useState<number | null>(settings.storeKecamatanId ?? null);
  const [storeKecamatanName, setStoreKecamatanName] = useState(settings.storeKecamatanName ?? "");
  const [storeKelurahanId, setStoreKelurahanId] = useState<number | null>(settings.storeKelurahanId ?? null);
  const [storeKelurahanName, setStoreKelurahanName] = useState(settings.storeKelurahanName ?? "");

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);

  // RajaOngkir store location
  const [roProvinces, setRoProvinces] = useState<RegionItem[]>([]);
  const [roCities, setRoCities] = useState<RegionItem[]>([]);
  const [roDistricts, setRoDistricts] = useState<RegionItem[]>([]);
  const [storeRoProvinceId, setStoreRoProvinceId] = useState<number | null>(settings.storeRoProvinceId ?? null);
  const [storeRoProvinceName, setStoreRoProvinceName] = useState(settings.storeRoProvinceName ?? "");
  const [storeRoCityId, setStoreRoCityId] = useState<number | null>(settings.storeRoCityId ?? null);
  const [storeRoCityName, setStoreRoCityName] = useState(settings.storeRoCityName ?? "");
  const [storeRoDistrictId, setStoreRoDistrictId] = useState<number | null>(settings.storeRoDistrictId ?? null);
  const [storeRoDistrictName, setStoreRoDistrictName] = useState(settings.storeRoDistrictName ?? "");
  const [loadingRoProvinces, setLoadingRoProvinces] = useState(false);
  const [loadingRoCities, setLoadingRoCities] = useState(false);
  const [loadingRoDistricts, setLoadingRoDistricts] = useState(false);

  useEffect(() => {
    if (activeTab === "store-location" && provinces.length === 0) {
      setLoadingProvinces(true);
      fetch("/api/kiriminaja/provinces")
        .then((r) => r.json())
        .then((d) => setProvinces(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingProvinces(false));
    }
  }, [activeTab, provinces.length]);

  useEffect(() => {
    if (storeProvinsiId) {
      setLoadingCities(true);
      fetch(`/api/kiriminaja/cities?provinsi_id=${storeProvinsiId}`)
        .then((r) => r.json())
        .then((d) => setCities(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingCities(false));
    }
  }, [storeProvinsiId]);

  useEffect(() => {
    if (storeKabupatenId) {
      setLoadingDistricts(true);
      fetch(`/api/kiriminaja/districts?kabupaten_id=${storeKabupatenId}`)
        .then((r) => r.json())
        .then((d) => setDistricts(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingDistricts(false));
    }
  }, [storeKabupatenId]);

  useEffect(() => {
    if (storeKecamatanId) {
      setLoadingSubdistricts(true);
      fetch(`/api/kiriminaja/subdistricts?kecamatan_id=${storeKecamatanId}`)
        .then((r) => r.json())
        .then((d) => setSubdistricts(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingSubdistricts(false));
    }
  }, [storeKecamatanId]);

  // RajaOngkir location cascade
  useEffect(() => {
    if (activeTab === "store-location" && shipping.rajaongkirEnabled && roProvinces.length === 0) {
      setLoadingRoProvinces(true);
      fetch("/api/rajaongkir/provinces")
        .then((r) => r.json())
        .then((d) => setRoProvinces(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingRoProvinces(false));
    }
  }, [activeTab, shipping.rajaongkirEnabled, roProvinces.length]);

  useEffect(() => {
    if (storeRoProvinceId) {
      setLoadingRoCities(true);
      fetch(`/api/rajaongkir/cities?province_id=${storeRoProvinceId}`)
        .then((r) => r.json())
        .then((d) => setRoCities(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingRoCities(false));
    }
  }, [storeRoProvinceId]);

  useEffect(() => {
    if (storeRoCityId) {
      setLoadingRoDistricts(true);
      fetch(`/api/rajaongkir/districts?city_id=${storeRoCityId}`)
        .then((r) => r.json())
        .then((d) => setRoDistricts(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoadingRoDistricts(false));
    }
  }, [storeRoCityId]);

  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      alert("Pengaturan tersimpan");
    } finally {
      setSaving(false);
    }
  };

  const saveStoreLocation = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...site,
          storeProvinsiId, storeProvinsiName,
          storeKabupatenId, storeKabupatenName,
          storeKecamatanId, storeKecamatanName,
          storeKelurahanId, storeKelurahanName,
          storeRoProvinceId, storeRoProvinceName,
          storeRoCityId, storeRoCityName,
          storeRoDistrictId, storeRoDistrictName,
        }),
      });
      alert("Lokasi toko tersimpan");
    } finally {
      setSaving(false);
    }
  };

  const saveShippingSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/shipping/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipping),
      });
      alert("Pengaturan pengiriman tersimpan");
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/payment/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      alert("Pengaturan pembayaran tersimpan");
    } finally {
      setSaving(false);
    }
  };

  const addBank = async () => {
    if (!newBank.bankName || !newBank.accountHolder || !newBank.accountNumber) return;
    setSavingBank(true);
    try {
      const res = await fetch("/api/payment/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBank),
      });
      const data = await res.json();
      setBanks([...banks, data]);
      setNewBank({ bankName: "", accountHolder: "", accountNumber: "", logoUrl: "" });
      setAddingBank(false);
    } finally {
      setSavingBank(false);
    }
  };

  const deleteBank = async (id: string) => {
    if (!confirm("Hapus rekening bank ini?")) return;
    await fetch(`/api/payment/bank-accounts/${id}`, { method: "DELETE" });
    setBanks(banks.filter((b) => b.id !== id));
  };

  const toggleBank = async (id: string, isActive: boolean) => {
    await fetch(`/api/payment/bank-accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setBanks(banks.map((b) => b.id === id ? { ...b, isActive } : b));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 flex-wrap">
        {([
          { key: "general", label: "Umum" },
          { key: "contact", label: "Kontak & Tampilan" },
          { key: "payment", label: "Pembayaran" },
          { key: "marketing", label: "Marketing" },
          { key: "store-location", label: "Lokasi Toko" },
          { key: "shipping", label: "Pengiriman" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Identitas Website</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Website</label>
              <input value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Utama (Header)</label>
                  <p className="text-xs text-gray-400 mb-1.5">Untuk background terang — header, login, email, admin</p>
                  <ImageUploader value={site.logoUrl ?? ""} onChange={(url) => setSite({ ...site, logoUrl: url })} folder="beeflower/settings" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lebar Logo Utama (px)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={40}
                      max={600}
                      value={site.logoWidth ?? 240}
                      onChange={(e) => setSite({ ...site, logoWidth: Number(e.target.value) || null })}
                      className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                    <span className="text-xs text-gray-400">px (desktop). Mobile menyesuaikan.</span>
                  </div>
                  {site.logoUrl && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 mb-1.5">Preview ukuran:</p>
                      <img
                        src={site.logoUrl}
                        alt="Logo preview"
                        style={{ maxWidth: `${site.logoWidth ?? 240}px`, height: "40px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo Terang (Footer)</label>
                  <p className="text-xs text-gray-400 mb-1.5">Untuk background gelap — footer</p>
                  <ImageUploader value={site.logoLightUrl ?? ""} onChange={(url) => setSite({ ...site, logoLightUrl: url })} folder="beeflower/settings" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lebar Logo Terang (px)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={40}
                      max={600}
                      value={site.logoLightWidth ?? 240}
                      onChange={(e) => setSite({ ...site, logoLightWidth: Number(e.target.value) || null })}
                      className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                    />
                    <span className="text-xs text-gray-400">px (desktop)</span>
                  </div>
                  {site.logoLightUrl && (
                    <div className="mt-2 p-3 bg-brand-brown rounded-lg">
                      <p className="text-xs text-brand-beige mb-1.5">Preview (background gelap):</p>
                      <img
                        src={site.logoLightUrl}
                        alt="Logo terang preview"
                        style={{ maxWidth: `${site.logoLightWidth ?? 240}px`, height: "40px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
              <p className="text-xs text-gray-400 mb-1.5">Ikon tab browser (.ico, .png, atau .svg)</p>
              <ImageUploader value={site.faviconUrl ?? ""} onChange={(url) => setSite({ ...site, faviconUrl: url })} folder="beeflower/settings" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
              <input value={site.metaTitle ?? ""} onChange={(e) => setSite({ ...site, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea value={site.metaDescription ?? ""} onChange={(e) => setSite({ ...site, metaDescription: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSite({ ...site, maintenanceMode: !site.maintenanceMode })}
                className={`relative w-10 h-6 rounded-full transition-colors ${site.maintenanceMode ? "bg-red-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${site.maintenanceMode ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-sm text-gray-700">Mode Maintenance</span>
            </label>
          </div>
          <button onClick={saveSiteSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan
          </button>
        </div>
      )}

      {activeTab === "contact" && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Informasi Kontak</h2>
            {([
              { key: "whatsapp", label: "WhatsApp (format: 628xxx)" },
              { key: "email", label: "Email" },
              { key: "instagram", label: "Instagram (tanpa @)" },
              { key: "tiktok", label: "TikTok (tanpa @)" },
              { key: "shopee", label: "Shopee (username)" },
              { key: "tokopedia", label: "Tokopedia (username)" },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input value={(site as any)[key] ?? ""} onChange={(e) => setSite({ ...site, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea value={site.address ?? ""} onChange={(e) => setSite({ ...site, address: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional</label>
              <textarea value={site.businessHours ?? ""} onChange={(e) => setSite({ ...site, businessHours: e.target.value })}
                rows={2} placeholder="Senin-Jumat: 09:00-17:00&#10;Sabtu: 09:00-14:00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <textarea value={site.googleMapsEmbed ?? ""} onChange={(e) => setSite({ ...site, googleMapsEmbed: e.target.value })}
                rows={2} placeholder="https://www.google.com/maps/embed?..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none" />
            </div>
          </div>
          <button onClick={saveSiteSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan
          </button>
        </div>
      )}

      {activeTab === "marketing" && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Facebook Pixel</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
              <p className="text-xs text-gray-400 mb-1.5">
                Temukan Pixel ID di Facebook Business Manager → Events Manager
              </p>
              <input
                value={site.facebookPixelId ?? ""}
                onChange={(e) => setSite({ ...site, facebookPixelId: e.target.value })}
                placeholder="Contoh: 1234567890123456"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold font-mono"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Custom Scripts</h2>
            <p className="text-xs text-gray-500">
              Masukkan kode JavaScript tanpa tag &lt;script&gt;. Cocok untuk Google Tag Manager, analitik, atau script iklan lainnya.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Script</label>
              <p className="text-xs text-gray-400 mb-1.5">Dimuat di awal halaman</p>
              <textarea
                value={site.headerScripts ?? ""}
                onChange={(e) => setSite({ ...site, headerScripts: e.target.value })}
                rows={5}
                placeholder={`// Contoh: Google Tag Manager\n(function(w,d,s,l,i){...})(...)`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Script</label>
              <p className="text-xs text-gray-400 mb-1.5">Dimuat setelah halaman selesai</p>
              <textarea
                value={site.footerScripts ?? ""}
                onChange={(e) => setSite({ ...site, footerScripts: e.target.value })}
                rows={5}
                placeholder={`// Contoh: custom analytics\nconsole.log('loaded');`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold resize-none font-mono"
              />
            </div>
          </div>

          <button
            onClick={saveSiteSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan Marketing
          </button>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="space-y-5 max-w-2xl">
          {/* Toggle Xendit */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Metode Pembayaran</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">Xendit (Online Payment)</p>
                <p className="text-xs text-gray-400">QRIS, Virtual Account, Credit Card via Xendit</p>
              </div>
              <div
                onClick={() => setPayment({ ...payment, xenditEnabled: !payment.xenditEnabled })}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${payment.xenditEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${payment.xenditEnabled ? "translate-x-4" : ""}`} />
              </div>
            </label>
            {payment.xenditEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xendit Secret Key</label>
                <input
                  type="password"
                  value={payment.xenditSecretKey ?? ""}
                  onChange={(e) => setPayment({ ...payment, xenditSecretKey: e.target.value })}
                  placeholder="xnd_production_..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>
            )}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">Transfer Bank Manual</p>
                <p className="text-xs text-gray-400">Customer transfer ke rekening bank dan upload bukti</p>
              </div>
              <div
                onClick={() => setPayment({ ...payment, manualTransferEnabled: !payment.manualTransferEnabled })}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${payment.manualTransferEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${payment.manualTransferEnabled ? "translate-x-4" : ""}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">QRIS</p>
                <p className="text-xs text-gray-400">Customer scan QR code untuk pembayaran</p>
              </div>
              <div
                onClick={() => setPayment({ ...payment, qrisEnabled: !payment.qrisEnabled })}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${payment.qrisEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${payment.qrisEnabled ? "translate-x-4" : ""}`} />
              </div>
            </label>
            {payment.qrisEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar QR Code QRIS</label>
                <p className="text-xs text-gray-400 mb-2">Upload QR code QRIS yang akan ditampilkan ke pelanggan</p>
                <ImageUploader
                  value={payment.qrisImageUrl ?? ""}
                  onChange={(url) => setPayment({ ...payment, qrisImageUrl: url })}
                  folder="beeflower/qris"
                />
              </div>
            )}
            <button onClick={savePaymentSettings} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Pengaturan Pembayaran
            </button>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Rekening Bank</h2>
              <button onClick={() => setAddingBank(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors">
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>

            {addingBank && (
              <div className="border border-brand-gold/30 rounded-lg p-4 bg-brand-cream/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Bank</label>
                    <input value={newBank.bankName} onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                      placeholder="BCA, BRI, BNI, dst"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nama Pemilik</label>
                    <input value={newBank.accountHolder} onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nomor Rekening</label>
                    <input value={newBank.accountNumber} onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-gold" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addBank} disabled={savingBank}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:opacity-50">
                    {savingBank ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Simpan
                  </button>
                  <button onClick={() => setAddingBank(false)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-gray-50">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {banks.length === 0 && !addingBank && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada rekening bank</p>
            )}
            {banks.map((bank) => (
              <div key={bank.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{bank.bankName}</p>
                  <p className="text-xs text-gray-500">{bank.accountHolder} — {bank.accountNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => toggleBank(bank.id, !bank.isActive)}
                    className={`relative w-8 h-5 rounded-full transition-colors cursor-pointer ${bank.isActive ? "bg-brand-gold" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${bank.isActive ? "translate-x-3" : ""}`} />
                  </div>
                  <button onClick={() => deleteBank(bank.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Lokasi Toko */}
      {activeTab === "store-location" && (
        <div className="space-y-5 max-w-xl">
          {!shipping.kiriminajaEnabled && !shipping.rajaongkirEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              Aktifkan provider pengiriman di tab <strong>Pengiriman</strong> terlebih dahulu, lalu set lokasi toko di sini.
            </div>
          )}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Lokasi Toko (Origin Pengiriman)</h2>
            <p className="text-xs text-gray-400">Lokasi ini digunakan sebagai titik asal perhitungan ongkos kirim KiriminAja.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <select
                value={storeProvinsiId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const name = provinces.find((p) => p.id === id)?.name ?? "";
                  setStoreProvinsiId(id || null);
                  setStoreProvinsiName(name);
                  setStoreKabupatenId(null); setStoreKabupatenName("");
                  setStoreKecamatanId(null); setStoreKecamatanName("");
                  setStoreKelurahanId(null); setStoreKelurahanName("");
                  setCities([]); setDistricts([]); setSubdistricts([]);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                disabled={loadingProvinces}
              >
                <option value="">{loadingProvinces ? "Memuat..." : "-- Pilih Provinsi --"}</option>
                {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {storeProvinsiId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
                <select
                  value={storeKabupatenId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = cities.find((c) => c.id === id)?.name ?? "";
                    setStoreKabupatenId(id || null);
                    setStoreKabupatenName(name);
                    setStoreKecamatanId(null); setStoreKecamatanName("");
                    setStoreKelurahanId(null); setStoreKelurahanName("");
                    setDistricts([]); setSubdistricts([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                  disabled={loadingCities}
                >
                  <option value="">{loadingCities ? "Memuat..." : "-- Pilih Kota/Kabupaten --"}</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {storeKabupatenId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <select
                  value={storeKecamatanId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = districts.find((d) => d.id === id)?.name ?? "";
                    setStoreKecamatanId(id || null);
                    setStoreKecamatanName(name);
                    setStoreKelurahanId(null); setStoreKelurahanName("");
                    setSubdistricts([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                  disabled={loadingDistricts}
                >
                  <option value="">{loadingDistricts ? "Memuat..." : "-- Pilih Kecamatan --"}</option>
                  {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {storeKecamatanId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
                <select
                  value={storeKelurahanId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = subdistricts.find((s) => s.id === id)?.name ?? "";
                    setStoreKelurahanId(id || null);
                    setStoreKelurahanName(name);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                  disabled={loadingSubdistricts}
                >
                  <option value="">{loadingSubdistricts ? "Memuat..." : "-- Pilih Kelurahan --"}</option>
                  {subdistricts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            {storeKelurahanId && (
              <div className="p-3 bg-brand-cream rounded-lg text-sm text-brand-brown">
                <p className="font-semibold mb-1">Lokasi terpilih:</p>
                <p>{storeKelurahanName}, {storeKecamatanName}, {storeKabupatenName}, {storeProvinsiName}</p>
              </div>
            )}

            <button
              onClick={saveStoreLocation}
              disabled={saving || !storeKelurahanId}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Lokasi Toko (KiriminAja)
            </button>
          </div>

          {/* RajaOngkir location */}
          {shipping.rajaongkirEnabled && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Lokasi Toko (RajaOngkir)</h2>
            <p className="text-xs text-gray-400">Pilih hingga level Kecamatan — ID ini digunakan sebagai origin kalkulasi ongkir RajaOngkir.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <select
                value={storeRoProvinceId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const name = roProvinces.find((p) => p.id === id)?.name ?? "";
                  setStoreRoProvinceId(id || null); setStoreRoProvinceName(name);
                  setStoreRoCityId(null); setStoreRoCityName("");
                  setStoreRoDistrictId(null); setStoreRoDistrictName("");
                  setRoCities([]); setRoDistricts([]);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                disabled={loadingRoProvinces}
              >
                <option value="">{loadingRoProvinces ? "Memuat..." : "-- Pilih Provinsi --"}</option>
                {roProvinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {storeRoProvinceId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kabupaten</label>
                <select
                  value={storeRoCityId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = roCities.find((c) => c.id === id)?.name ?? "";
                    setStoreRoCityId(id || null); setStoreRoCityName(name);
                    setStoreRoDistrictId(null); setStoreRoDistrictName("");
                    setRoDistricts([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                  disabled={loadingRoCities}
                >
                  <option value="">{loadingRoCities ? "Memuat..." : "-- Pilih Kota/Kabupaten --"}</option>
                  {roCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {storeRoCityId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <select
                  value={storeRoDistrictId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const name = roDistricts.find((d) => d.id === id)?.name ?? "";
                    setStoreRoDistrictId(id || null); setStoreRoDistrictName(name);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold bg-white disabled:bg-gray-50"
                  disabled={loadingRoDistricts}
                >
                  <option value="">{loadingRoDistricts ? "Memuat..." : "-- Pilih Kecamatan --"}</option>
                  {roDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {storeRoDistrictId && (
              <div className="p-3 bg-brand-cream rounded-lg text-sm text-brand-brown">
                <p className="font-semibold mb-1">Lokasi terpilih:</p>
                <p>{storeRoDistrictName}, {storeRoCityName}, {storeRoProvinceName}</p>
                <p className="text-xs text-gray-400 mt-1">District ID: {storeRoDistrictId}</p>
              </div>
            )}

            <button
              onClick={saveStoreLocation}
              disabled={saving || !storeRoDistrictId}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Lokasi Toko (RajaOngkir)
            </button>
          </div>
          )}
        </div>
      )}

      {/* Tab: Pengiriman */}
      {activeTab === "shipping" && (
        <div className="space-y-5 max-w-xl">
          {/* Provider selection — mutually exclusive */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Metode Kalkulasi Ongkir Real-time</h2>
              <p className="text-xs text-gray-400">Hanya satu provider yang dapat aktif sekaligus.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "none", label: "Tidak Ada", desc: "Hanya Flat Rate atau tanpa kalkulasi ongkir" },
                { value: "kiriminaja", label: "KiriminAja", desc: "Kalkulasi ongkir real-time via KiriminAja" },
                { value: "rajaongkir", label: "RajaOngkir (Komerce)", desc: "Kalkulasi ongkir real-time via RajaOngkir" },
              ].map((opt) => {
                const active = opt.value === "none"
                  ? !shipping.kiriminajaEnabled && !shipping.rajaongkirEnabled
                  : opt.value === "kiriminaja" ? shipping.kiriminajaEnabled : shipping.rajaongkirEnabled;
                return (
                  <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:border-brand-gold/40 transition-colors">
                    <input
                      type="radio"
                      name="shippingProvider"
                      checked={!!active}
                      onChange={() => setShipping({
                        ...shipping,
                        kiriminajaEnabled: opt.value === "kiriminaja",
                        rajaongkirEnabled: opt.value === "rajaongkir",
                      })}
                      className="mt-0.5 accent-brand-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* KiriminAja config */}
          {shipping.kiriminajaEnabled && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Konfigurasi KiriminAja</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token API KiriminAja (opsional)</label>
              <input
                value={shipping.kiriminajaToken ?? ""}
                onChange={(e) => setShipping({ ...shipping, kiriminajaToken: e.target.value || null })}
                placeholder="Default dari env KIRIMINAJA_TOKEN"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Kosongkan jika sudah set di environment variable Vercel.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kurir yang diaktifkan</label>
              <div className="flex flex-wrap gap-3">
                {ALL_COURIERS.map((c) => {
                  const active = shipping.couriers?.includes(c.code);
                  return (
                    <label key={c.code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!active}
                        onChange={() => {
                          const current = shipping.couriers ?? [];
                          const next = active ? current.filter((x) => x !== c.code) : [...current, c.code];
                          setShipping({ ...shipping, couriers: next });
                        }}
                        className="w-4 h-4 accent-brand-gold"
                      />
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          )}

          {/* RajaOngkir config */}
          {shipping.rajaongkirEnabled && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Konfigurasi RajaOngkir</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key RajaOngkir (opsional)</label>
              <input
                value={shipping.rajaongkirApiKey ?? ""}
                onChange={(e) => setShipping({ ...shipping, rajaongkirApiKey: e.target.value || null })}
                placeholder="Default dari env RAJAONGKIR_API_KEY"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Kosongkan jika sudah set di environment variable Vercel.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kurir yang diaktifkan</label>
              <div className="flex flex-wrap gap-3">
                {ALL_COURIERS.map((c) => {
                  const active = (shipping.rajaongkirCouriers ?? []).includes(c.code);
                  return (
                    <label key={c.code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!active}
                        onChange={() => {
                          const current = shipping.rajaongkirCouriers ?? [];
                          const next = active ? current.filter((x) => x !== c.code) : [...current, c.code];
                          setShipping({ ...shipping, rajaongkirCouriers: next });
                        }}
                        className="w-4 h-4 accent-brand-gold"
                      />
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          )}

          {/* Flat Rate */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Flat Rate</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ongkir tetap terlepas dari lokasi tujuan</p>
              </div>
              <div
                onClick={() => setShipping({ ...shipping, flatRateEnabled: !shipping.flatRateEnabled })}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${shipping.flatRateEnabled ? "bg-brand-gold" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${shipping.flatRateEnabled ? "translate-x-4" : ""}`} />
              </div>
            </div>

            {shipping.flatRateEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Flat Rate (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={shipping.flatRateAmount ?? ""}
                    onChange={(e) => setShipping({ ...shipping, flatRateAmount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Contoh: 20000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label (opsional)</label>
                  <input
                    value={shipping.flatRateLabel ?? ""}
                    onChange={(e) => setShipping({ ...shipping, flatRateLabel: e.target.value || null })}
                    placeholder="Contoh: Flat Rate Nasional"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={saveShippingSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan Pengiriman
          </button>
        </div>
      )}
    </div>
  );
}
