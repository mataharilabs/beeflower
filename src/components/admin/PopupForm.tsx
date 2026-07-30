"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const PopupEditor = dynamic(() => import("./PopupEditor").then((m) => m.PopupEditor), {
  ssr: false,
  loading: () => <div className="border border-gray-200 rounded-lg h-48 bg-gray-50 animate-pulse" />,
});

interface PopupData {
  id: string;
  title: string;
  description: string | null;
  content: string;
  useCookies: boolean;
  cookieDays: number;
  delaySeconds: number;
  width: number;
  height: number | null;
  startAt: Date | null;
  endAt: Date | null;
  isActive: boolean;
}

interface Props {
  popup?: PopupData | null;
}

export function PopupForm({ popup }: Props) {
  const router = useRouter();
  const isEdit = !!popup;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(popup?.title ?? "");
  const [description, setDescription] = useState(popup?.description ?? "");
  const [content, setContent] = useState(popup?.content ?? "");
  const [useCookies, setUseCookies] = useState(popup?.useCookies ?? true);
  const [cookieDays, setCookieDays] = useState(popup?.cookieDays ?? 7);
  const [delaySeconds, setDelaySeconds] = useState(popup?.delaySeconds ?? 0);
  const [width, setWidth] = useState(popup?.width ?? 500);
  const [height, setHeight] = useState<number | "">(popup?.height ?? "");
  const [startAt, setStartAt] = useState(
    popup?.startAt ? new Date(popup.startAt).toISOString().slice(0, 16) : ""
  );
  const [endAt, setEndAt] = useState(
    popup?.endAt ? new Date(popup.endAt).toISOString().slice(0, 16) : ""
  );
  const [isActive, setIsActive] = useState(popup?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Judul wajib diisi"); return; }
    if (!content || content === "<p></p>") { setError("Konten popup wajib diisi"); return; }

    setLoading(true);
    setError("");
    try {
      const body = {
        title,
        description: description || null,
        content,
        useCookies,
        cookieDays,
        delaySeconds,
        width,
        height: height !== "" ? Number(height) : null,
        startAt: startAt || null,
        endAt: endAt || null,
        isActive,
      };

      const url = isEdit ? `/api/popups/${popup.id}` : "/api/popups";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Terjadi kesalahan"); return; }

      router.push("/admin/popups");
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
          <label className={labelClass}>Judul *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Contoh: Promo Spesial Agustus" />
        </div>
        <div>
          <label className={labelClass}>Deskripsi (internal)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Catatan internal untuk popup ini" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`${labelClass} mb-0`}>Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isActive ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-gray-700">{isActive ? "Aktif" : "Tidak Aktif"}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Konten Popup *</h2>
        <p className="text-xs text-gray-400 -mt-2">Gunakan toolbar untuk format teks, sisipkan gambar dengan URL, dan tambahkan link.</p>
        <PopupEditor content={content} onChange={setContent} />
      </div>

      {/* Config */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Konfigurasi Tampil</h2>

        {/* Cookie behavior */}
        <div>
          <label className={labelClass}>Perilaku Cookies</label>
          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="cookies" checked={useCookies} onChange={() => setUseCookies(true)} className="mt-0.5" />
              <div>
                <span className="text-sm text-gray-700 font-medium">Gunakan cookies</span>
                <p className="text-xs text-gray-400">Popup tidak muncul lagi setelah user menutupnya, selama periode yang ditentukan</p>
              </div>
            </label>
            {useCookies && (
              <div className="ml-5">
                <label className={labelClass}>Durasi tidak muncul lagi</label>
                <select value={cookieDays} onChange={(e) => setCookieDays(Number(e.target.value))} className={inputClass}>
                  <option value={1}>1 Hari</option>
                  <option value={7}>7 Hari</option>
                  <option value={30}>1 Bulan (30 Hari)</option>
                </select>
              </div>
            )}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="cookies" checked={!useCookies} onChange={() => setUseCookies(false)} className="mt-0.5" />
              <div>
                <span className="text-sm text-gray-700 font-medium">Selalu tampil</span>
                <p className="text-xs text-gray-400">Popup muncul setiap kali halaman dibuka</p>
              </div>
            </label>
          </div>
        </div>

        {/* Delay */}
        <div>
          <label className={labelClass}>Delay Munculnya Popup (detik)</label>
          <input
            type="number"
            min={0}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
            className={inputClass}
            placeholder="0 = langsung muncul"
          />
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Lebar Popup (px)</label>
            <input
              type="number"
              min={200}
              max={1200}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tinggi Popup (px, kosong = otomatis)</label>
            <input
              type="number"
              min={100}
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              className={inputClass}
              placeholder="auto"
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-gray-900">Jadwal Tampil (Opsional)</h2>
        <p className="text-xs text-gray-400 -mt-2">Kosongkan jika popup aktif seumur hidup selama status Aktif.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Mulai Dari</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sampai</label>
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Popup"}
        </button>
      </div>
    </form>
  );
}
