import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[120px] font-bold text-brand-gold/20 leading-none select-none">404</p>
      <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mt-2 mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-brand-brown/60 max-w-sm text-sm leading-relaxed mb-8">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
        Kembali ke beranda atau jelajahi produk kami.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-brand-brown text-white font-semibold text-sm rounded tracking-wide hover:bg-brand-gold transition-colors"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/toko"
          className="px-6 py-3 border-2 border-brand-brown text-brand-brown font-semibold text-sm rounded tracking-wide hover:bg-brand-brown hover:text-white transition-colors"
        >
          Lihat Toko
        </Link>
      </div>
      <p className="mt-16 text-brand-beige text-xs tracking-widest uppercase select-none">
        Bee &amp; Flower Brand
      </p>
    </div>
  );
}
