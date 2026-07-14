"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface SiteSettings {
  id: string;
  siteName: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
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
  maintenanceMode: boolean;
}

interface PaymentSettings {
  id: string;
  xenditEnabled: boolean;
  xenditSecretKey: string | null;
  manualTransferEnabled: boolean;
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

interface Props {
  settings: SiteSettings;
  paymentSettings: PaymentSettings;
  bankAccounts: BankAccount[];
}

export function SettingsClient({ settings, paymentSettings, bankAccounts: initialBanks }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "contact">("general");
  const [saving, setSaving] = useState(false);

  const [site, setSite] = useState(settings);
  const [payment, setPayment] = useState(paymentSettings);
  const [banks, setBanks] = useState(initialBanks);
  const [newBank, setNewBank] = useState({ bankName: "", accountHolder: "", accountNumber: "", logoUrl: "" });
  const [addingBank, setAddingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

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
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          { key: "general", label: "Umum" },
          { key: "contact", label: "Kontak & Tampilan" },
          { key: "payment", label: "Pembayaran" },
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Utama (Header)</label>
                <p className="text-xs text-gray-400 mb-1.5">Untuk background terang</p>
                <ImageUploader value={site.logoUrl ?? ""} onChange={(url) => setSite({ ...site, logoUrl: url })} folder="beeflower/settings" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Terang (Footer)</label>
                <p className="text-xs text-gray-400 mb-1.5">Untuk background gelap</p>
                <ImageUploader value={site.logoLightUrl ?? ""} onChange={(url) => setSite({ ...site, logoLightUrl: url })} folder="beeflower/settings" />
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
    </div>
  );
}
