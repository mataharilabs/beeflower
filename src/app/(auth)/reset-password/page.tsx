"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-sm mb-4">Link reset password tidak valid.</p>
        <Link href="/forgot-password" className="text-brand-gold hover:underline text-sm font-semibold">
          Minta link baru
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan");
      } else {
        router.push("/login?reset=success");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
          {(error.includes("kadaluarsa") || error.includes("tidak valid")) && (
            <div className="mt-2">
              <Link href="/forgot-password" className="text-red-700 font-semibold underline text-xs">
                Minta link baru
              </Link>
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">Password Baru</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-10 border border-brand-beige rounded-lg text-sm focus:outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-beige hover:text-brand-brown"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1.5">Konfirmasi Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 border border-brand-beige rounded-lg text-sm focus:outline-none focus:border-brand-gold"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand-gold text-white font-semibold rounded-lg text-sm tracking-wide hover:bg-brand-brown transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Simpan Password Baru"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="font-bold text-2xl text-brand-brown">Password Baru</h1>
          <p className="text-sm text-brand-beige mt-2">Masukkan password baru Anda</p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/login" className="text-brand-gold hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
