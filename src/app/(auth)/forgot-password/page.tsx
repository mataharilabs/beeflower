"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-brown mb-2">Cek Email Anda</h2>
          <p className="text-sm text-gray-500 mb-6">
            Jika email <strong>{email}</strong> terdaftar, kami telah mengirimkan link untuk mengatur ulang password. Link berlaku selama 1 jam.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 bg-brand-gold text-white font-semibold rounded-lg text-sm text-center hover:bg-brand-brown transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-bold text-2xl text-brand-brown">Lupa Password</h1>
          <p className="text-sm text-brand-beige mt-2">Masukkan email untuk menerima link reset</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm focus:outline-none focus:border-brand-gold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gold text-white font-semibold rounded-lg text-sm tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Kirim Link Reset"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Sudah ingat password?{" "}
          <Link href="/login" className="text-brand-gold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
