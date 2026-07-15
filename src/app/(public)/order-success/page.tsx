"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, User2 } from "lucide-react";

interface NewAccountInfo {
  email: string;
  password: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") ?? "";
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const method = searchParams.get("method") ?? "";

  const [newAccount, setNewAccount] = useState<NewAccountInfo | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("newAccount");
      if (stored) {
        setNewAccount(JSON.parse(stored));
        sessionStorage.removeItem("newAccount");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-brown mb-2">Terima Kasih!</h1>
          <p className="text-gray-500 mb-3">Pesanan Anda sudah masuk dan sedang diproses.</p>
          {orderNumber && (
            <div className="inline-flex items-center gap-2 bg-brand-cream px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-500">No. Pesanan:</span>
              <span className="font-mono font-bold text-brand-brown">{orderNumber}</span>
            </div>
          )}
          {method === "transfer" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
              Segera upload bukti transfer agar pesanan cepat diproses.
            </p>
          )}
        </div>

        {newAccount && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <User2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <h2 className="font-semibold text-brand-brown">Akun Anda Berhasil Dibuat!</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Gunakan informasi berikut untuk masuk ke area member:
            </p>
            <div className="bg-brand-cream rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-brand-brown break-all">{newAccount.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Password</span>
                <span className="font-mono font-bold text-brand-brown tracking-widest">{newAccount.password}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Informasi login juga sudah dikirim ke email Anda.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {orderId && method === "transfer" && (
            <Link
              href={`/toko/pesanan/${orderId}`}
              className="block w-full text-center py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors"
            >
              Upload Bukti Transfer
            </Link>
          )}
          <Link
            href="/member/orders"
            className="block w-full text-center py-3 bg-white border border-brand-beige text-brand-brown rounded-xl font-semibold hover:bg-brand-cream transition-colors"
          >
            Lihat Pesanan Saya
          </Link>
          <Link
            href="/toko"
            className="block w-full text-center py-2.5 text-sm text-brand-beige hover:text-brand-brown transition-colors"
          >
            Kembali ke Toko
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}
