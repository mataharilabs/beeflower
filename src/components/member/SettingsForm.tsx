"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

interface Props {
  user: { name?: string | null; email?: string | null; phone?: string | null };
}

export function SettingsForm({ user }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }
    if (form.newPassword && !form.currentPassword) {
      setError("Masukkan password lama untuk mengubah password");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        name: form.name,
        phone: form.phone,
      };
      if (form.newPassword && form.currentPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword = form.newPassword;
      }

      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan perubahan");
        return;
      }

      setSuccess(true);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-100 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          Perubahan berhasil disimpan!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          value={user?.email ?? ""}
          disabled
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Email tidak bisa diubah</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Contoh: 08xxxxxxxxxx"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
        />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Ubah Password (opsional)</p>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Password Lama"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
          <input
            type="password"
            placeholder="Password Baru (min. 6 karakter)"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
          <input
            type="password"
            placeholder="Konfirmasi Password Baru"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand-gold text-white font-semibold rounded-xl text-sm hover:bg-brand-brown transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  );
}
