import { prisma } from "@/lib/prisma";
import { ResellerSearch } from "@/components/toko-reseller/ResellerSearch";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export const revalidate = 900;

export const metadata = {
  title: "Toko Reseller | Bee & Flower Brand",
  description: "Temukan toko reseller Bee & Flower Brand terdekat di seluruh Indonesia.",
};

export default async function TokoResellerPage() {
  const [stores, page] = await Promise.all([
    prisma.resellerStore.findMany({
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
    }),
    prisma.page.findUnique({ where: { slug: "toko-reseller" } }),
  ]);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* CMS blocks - header yang bisa diedit admin */}
      {page?.craftJson && (
        <BlockRenderer document={page.craftJson as object} />
      )}

      {/* Daftar toko reseller - hardcoded */}
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
