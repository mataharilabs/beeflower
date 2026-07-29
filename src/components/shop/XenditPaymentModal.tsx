"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  paymentUrl: string;
  orderId: string;
  autoOpen?: boolean;
}

export function XenditPaymentModal({ paymentUrl, orderId, autoOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          clearInterval(interval);
          window.location.href = `/toko/pesanan/${orderId}?status=success`;
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, orderId]);

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setIframeError(false); setIframeLoading(true); }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-white rounded-xl font-semibold hover:bg-brand-brown transition-colors"
      >
        Lanjutkan Pembayaran
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <p className="font-semibold text-brand-brown text-sm">Pembayaran Online</p>
              <div className="flex items-center gap-1">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-brand-brown rounded-lg hover:bg-gray-50 transition-colors"
                  title="Buka di tab baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-brand-brown rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {iframeError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-500 mb-2 text-sm">Halaman pembayaran tidak dapat dimuat di sini.</p>
                <p className="text-gray-400 mb-6 text-xs">Gunakan tombol di bawah untuk membuka di tab baru. Setelah pembayaran selesai, halaman ini akan otomatis diperbarui.</p>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white rounded-lg font-semibold hover:bg-brand-brown transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka Halaman Pembayaran
                </a>
              </div>
            ) : (
              <div className="relative flex-1">
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm">Memuat halaman pembayaran...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={paymentUrl}
                  className="w-full h-full border-0"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => { setIframeError(true); setIframeLoading(false); }}
                  title="Pembayaran Xendit"
                  allow="payment"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
