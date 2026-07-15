import { prisma } from "@/lib/prisma";
import { ResellerSearch } from "@/components/toko-reseller/ResellerSearch";

export const metadata = {
  title: "Toko Reseller | Bee & Flower Brand",
  description: "Temukan toko reseller Bee & Flower Brand terdekat di seluruh Indonesia.",
};

export default async function TokoResellerPage() {
  const stores = await prisma.resellerStore.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { province: "asc" }, { city: "asc" }],
    select: {
      id: true,
      name: true,
      logoUrl: true,
      address: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      tiktok: true,
      shopee: true,
      tokopedia: true,
      province: true,
      city: true,
    },
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="relative bg-brand-brown overflow-hidden">
        {/* Indonesia silhouette SVG */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 900 260"
            className="w-full h-full opacity-[0.08]"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Sumatra */}
            <ellipse cx="130" cy="130" rx="130" ry="52" transform="rotate(-32 130 130)" fill="white" />
            {/* Java */}
            <ellipse cx="285" cy="205" rx="85" ry="20" transform="rotate(-5 285 205)" fill="white" />
            {/* Bali + Lombok */}
            <ellipse cx="388" cy="218" rx="14" ry="10" fill="white" />
            <ellipse cx="408" cy="220" rx="10" ry="8" fill="white" />
            {/* Nusa Tenggara */}
            <ellipse cx="450" cy="225" rx="35" ry="8" fill="white" />
            {/* Kalimantan */}
            <ellipse cx="430" cy="110" rx="115" ry="95" fill="white" />
            {/* Sulawesi - simplified K/orchid shape */}
            <path d="M 548 55 Q 565 40 578 62 Q 588 90 578 125 Q 566 165 550 185 Q 534 192 528 175 Q 536 148 540 125 Q 562 95 542 72 Z" fill="white" />
            <path d="M 540 125 Q 528 140 510 155 Q 495 160 492 148 Q 503 135 520 125 Z" fill="white" />
            <path d="M 578 62 Q 598 58 614 72 Q 620 88 608 100 Q 594 108 578 100 Z" fill="white" />
            {/* Maluku */}
            <circle cx="660" cy="115" r="12" fill="white" />
            <circle cx="676" cy="145" r="9" fill="white" />
            <circle cx="650" cy="150" r="7" fill="white" />
            <circle cx="700" cy="120" r="8" fill="white" />
            {/* Papua */}
            <path d="M 720 75 Q 760 50 820 60 Q 875 72 890 110 Q 895 145 875 175 Q 848 200 800 205 Q 750 205 720 185 Q 695 165 695 130 Q 698 95 720 75 Z" fill="white" />
            {/* Scattered small islands */}
            <circle cx="360" cy="190" r="6" fill="white" />
            <circle cx="490" cy="185" r="8" fill="white" />
          </svg>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-brand-gold opacity-30" />
        <div className="absolute top-12 right-24 w-1 h-1 rounded-full bg-brand-gold opacity-20" />
        <div className="absolute bottom-8 left-12 w-1.5 h-1.5 rounded-full bg-brand-gold opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5">
            Jaringan Reseller
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Toko Reseller<br />
            <span className="text-brand-gold">Bee &amp; Flower Brand</span>
          </h1>
          <p className="text-brand-beige text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Temukan reseller Bee &amp; Flower Brand terdekat di kotamu.
            Cari berdasarkan provinsi atau kota untuk menemukan produk asli berkualitas.
          </p>

          {stores.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-6 text-brand-beige text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stores.length}</p>
                <p className="text-xs">Toko Reseller</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {new Set(stores.map((s) => s.province)).size}
                </p>
                <p className="text-xs">Provinsi</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {new Set(stores.map((s) => s.city)).size}
                </p>
                <p className="text-xs">Kota</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {stores.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg className="w-10 h-10 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-brand-brown mb-2">Belum Ada Toko Reseller</h2>
            <p className="text-brand-beige text-sm">
              Daftar toko reseller akan segera hadir. Hubungi kami untuk menjadi reseller Bee &amp; Flower Brand.
            </p>
          </div>
        ) : (
          <ResellerSearch stores={stores} />
        )}
      </div>
    </div>
  );
}
