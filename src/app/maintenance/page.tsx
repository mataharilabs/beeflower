import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sedang dalam Perbaikan - Bee & Flower Brand",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-brand-brown flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <p className="text-brand-gold text-4xl font-bold tracking-widest select-none">B&amp;F</p>
        <p className="text-brand-beige text-xs tracking-[4px] uppercase mt-1">Bee &amp; Flower Brand</p>
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
        Sedang dalam Perbaikan
      </h1>
      <p className="text-brand-beige max-w-sm text-sm leading-relaxed mb-8">
        Website kami sedang dalam pemeliharaan sementara.
        Kami akan kembali segera. Terima kasih atas kesabaran Anda.
      </p>

      <div className="w-12 h-px bg-brand-gold/40 mb-8" />

      <p className="text-brand-beige/60 text-xs">
        Pertanyaan?{" "}
        <a
          href="https://wa.me/6281234567890"
          className="text-brand-gold hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hubungi kami via WhatsApp
        </a>
      </p>
    </div>
  );
}
