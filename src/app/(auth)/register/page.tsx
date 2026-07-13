"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Password tidak cocok");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal mendaftar");
        return;
      }
      router.push("/login?registered=1");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-brown">Daftar Akun</h1>
          <p className="text-sm text-gray-500 mt-1">Bee & Flower Brand</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {(["name", "email", "phone", "password", "confirm"] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === "confirm" ? "Konfirmasi Password" :
                 field === "phone" ? "Nomor Telepon" :
                 field === "name" ? "Nama Lengkap" : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "password" || field === "confirm" ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={field !== "phone"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-gold text-white rounded-lg text-sm font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Daftar Sekarang
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-brand-gold font-medium hover:text-brand-brown">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
