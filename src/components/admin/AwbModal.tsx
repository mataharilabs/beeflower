"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Package } from "lucide-react";

const COURIERS = ["JNE", "J&T Express", "SiCepat", "Anteraja", "Pos Indonesia", "Lainnya"];

interface Props {
  orderId: string;
  orderNumber: string;
  currentAwbNumber?: string | null;
  currentAwbCourier?: string | null;
}

export function AwbModal({ orderId, orderNumber, currentAwbNumber, currentAwbCourier }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCustomCourier = currentAwbCourier && !COURIERS.slice(0, -1).includes(currentAwbCourier);
  const [courierSelect, setCourierSelect] = useState(
    isCustomCourier ? "Lainnya" : (currentAwbCourier ?? "JNE")
  );
  const [courierCustom, setCourierCustom] = useState(isCustomCourier ? currentAwbCourier : "");
  const [awbNumber, setAwbNumber] = useState(currentAwbNumber ?? "");

  const finalCourier = courierSelect === "Lainnya" ? courierCustom : courierSelect;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbNumber.trim()) { setError("No. Resi wajib diisi"); return; }
    if (!finalCourier?.trim()) { setError("Nama kurir wajib diisi"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/awb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awbNumber: awbNumber.trim(), awbCourier: finalCourier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan"); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors"
      >
        <Package className="w-4 h-4" />
        {currentAwbNumber ? "Edit AWB / Resi" : "Add AWB / Resi"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">Tambah AWB / No. Resi</h2>
                <p className="text-xs text-gray-400 mt-0.5">Order #{orderNumber}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kurir *</label>
                <select
                  value={courierSelect}
                  onChange={(e) => setCourierSelect(e.target.value)}
                  className={inputClass}
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {courierSelect === "Lainnya" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Kurir *</label>
                  <input
                    value={courierCustom}
                    onChange={(e) => setCourierCustom(e.target.value)}
                    placeholder="Contoh: Ninja Express, Wahana, ..."
                    className={inputClass}
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">No. Resi / AWB *</label>
                <input
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="Masukkan nomor resi pengiriman"
                  className={`${inputClass} font-mono tracking-wider`}
                  autoFocus={courierSelect !== "Lainnya"}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan & Kirim Email
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Customer akan mendapat email notifikasi berisi no. resi dan kurir
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
