"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[100px] font-bold text-brand-gold/20 leading-none select-none">!</p>
      <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mt-2 mb-3">
        Terjadi Kesalahan
      </h1>
      <p className="text-brand-brown/60 max-w-sm text-sm leading-relaxed mb-8">
        Maaf, ada masalah yang tidak terduga. Tim kami sedang bekerja untuk memperbaikinya.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-brand-brown text-white font-semibold text-sm rounded tracking-wide hover:bg-brand-gold transition-colors"
        >
          Coba Lagi
        </button>
        <a
          href="/"
          className="px-6 py-3 border-2 border-brand-brown text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-brown hover:text-white transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
      <p className="mt-16 text-brand-beige text-xs tracking-widest uppercase select-none">
        Bee &amp; Flower Brand
      </p>
    </div>
  );
}
