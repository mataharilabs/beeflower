"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, User2, CreditCard, QrCode } from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  logoUrl: string | null;
}

interface NewAccountInfo {
  email: string;
  password: string;
}

interface Props {
  bankAccounts: BankAccount[];
  qrisImageUrl: string | null;
}

export function OrderSuccessContent({ bankAccounts, qrisImageUrl }: Props) {
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

  const isPaymentNeeded = method === "transfer" || method === "qris";

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-4">
        {/* Success card */}
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
          {isPaymentNeeded && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
              {method === "qris"
                ? "Scan QR Code di bawah untuk menyelesaikan pembayaran."
                : "Segera lakukan transfer agar pesanan cepat diproses."}
            </p>
          )}
        </div>

        {/* New account info */}
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

        {/* Bank transfer info */}
        {method === "transfer" && bankAccounts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <h2 className="font-semibold text-brand-brown">Informasi Transfer</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Silakan transfer ke salah satu rekening berikut:
            </p>
            <div className="space-y-3">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="bg-brand-cream rounded-xl p-4">
                  <p className="text-sm font-bold text-brand-brown">{bank.bankName}</p>
                  <p className="text-xs text-gray-500">{bank.accountHolder}</p>
                  <p className="text-lg font-mono font-bold text-brand-brown mt-1">{bank.accountNumber}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QRIS info */}
        {method === "qris" && qrisImageUrl && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <h2 className="font-semibold text-brand-brown">Scan QR Code untuk Bayar</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Scan QR code dengan aplikasi e-wallet atau mobile banking Anda.
            </p>
            <div className="flex justify-center">
              <img
                src={qrisImageUrl}
                alt="QRIS QR Code"
                className="max-w-[250px] w-full rounded-xl border border-brand-cream"
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {orderId && isPaymentNeeded && (
            <Link
              href={`/toko/pesanan/${orderId}`}
              className="block w-full text-center py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors"
            >
              {method === "qris" ? "Upload Bukti Pembayaran" : "Upload Bukti Transfer"}
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
