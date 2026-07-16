import Link from "next/link";
import { Plus, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeletePageButton } from "@/components/admin/DeletePageButton";

const SYSTEM_SLUGS = ["home", "reseller", "contact"] as const;

const SYSTEM_PAGE_DEFAULTS: Record<
  (typeof SYSTEM_SLUGS)[number],
  { title: string; craftJson: object }
> = {
  home: {
    title: "Homepage",
    craftJson: {
      blocks: [
        {
          id: "our-story",
          type: "ImageText",
          props: {
            headline: "Lebih dari Sekedar Sabun",
            content:
              "Selama bertahun-tahun, Bee & Flower dikenal melalui aroma khas dan kualitas produknya. Dengan karakter klasik yang tetap relevan hingga kini, Bee & Flower hadir sebagai pilihan untuk Anda yang menghargai keharuman, kenyamanan, dan kualitas dalam setiap rutinitas perawatan diri.",
            imageUrl: "",
            imagePosition: "right",
            buttonText: "Tentang Bee & Flower",
            buttonLink: "/reseller",
          },
        },
        {
          id: "why-bf",
          type: "FeatureIcons",
          props: {
            headline: "Mengapa Bee & Flower",
            items: [
              {
                icon: "Leaf",
                title: "Aroma Khas yang Ikonik",
                description:
                  "Keharuman yang menjadi ciri khas Bee & Flower memberikan pengalaman mandi yang menyegarkan dan berkesan.",
              },
              {
                icon: "Shield",
                title: "Formula Berkualitas",
                description:
                  "Membersihkan kulit dengan lembut dan nyaman digunakan sebagai bagian dari rutinitas harian.",
              },
              {
                icon: "Star",
                title: "Dipercaya Lintas Generasi",
                description:
                  "Pilihan banyak keluarga yang tetap mempertahankan kualitas dan karakter aromanya hingga saat ini.",
              },
            ],
          },
        },
        {
          id: "business-cta",
          type: "CTABanner",
          props: {
            headline: "Jadilah Bagian Dari Perjalanan Bee & Flower",
            subheadline:
              "Mulai bisnis Anda bersama produk yang telah dikenal luas dan didukung dengan materi promosi serta harga khusus untuk reseller.",
            buttonText: "GABUNG SEKARANG",
            buttonLink: "/reseller",
            bgColor: "#3A2D1D",
          },
        },
        {
          id: "faq",
          type: "FAQSection",
          props: {
            headline: "FAQ",
            items: [
              {
                question: "Apakah produk Bee & Flower original?",
                answer:
                  "Ya, semua produk yang kami jual adalah produk original Bee & Flower Brand yang telah dipercaya sejak tahun 1928.",
              },
              {
                question: "Apakah tersedia pengiriman ke seluruh Indonesia?",
                answer:
                  "Ya, kami melayani pengiriman ke seluruh wilayah Indonesia dengan jasa pengiriman terpercaya.",
              },
              {
                question: "Bagaimana cara menjadi reseller?",
                answer:
                  "Kunjungi halaman Reseller kami dan hubungi tim kami melalui WhatsApp untuk informasi lengkap.",
              },
            ],
          },
        },
        {
          id: "bottom-cta",
          type: "CTABanner",
          props: {
            headline: "Saatnya Menemukan Aroma Favorit Anda",
            subheadline:
              "Temukan koleksi Bee & Flower dan nikmati pengalaman mandi yang lebih berkesan setiap hari.",
            buttonText: "BELANJA SEKARANG",
            buttonLink: "/toko",
            bgColor: "#AF8442",
          },
        },
      ],
    },
  },
  reseller: {
    title: "Halaman Reseller",
    craftJson: {
      blocks: [
        {
          id: "hero",
          type: "Hero",
          props: {
            headline: "Bangun Bisnis Bersama Bee & Flower",
            subheadline:
              "Produk yang telah dipercaya pelanggan, didukung sistem pemesanan yang mudah dan materi promosi yang siap digunakan.",
            buttonText: "GABUNG MENJADI RESELLER",
            buttonLink:
              "https://wa.me/6285175273181?text=Halo,%20saya%20ingin%20menjadi%20reseller%20Bee%20%26%20Flower",
            bgImage: "",
            overlay: true,
          },
        },
        {
          id: "benefits",
          type: "FeatureIcons",
          props: {
            headline: "Mengapa Menjadi Reseller",
            items: [
              { icon: "TrendingUp", title: "Margin Kompetitif", description: "Dapatkan margin keuntungan yang menarik untuk setiap produk yang Anda jual." },
              { icon: "Shield", title: "Produk Original", description: "Semua produk terjamin original langsung dari distributor resmi." },
              { icon: "Package", title: "Dukungan Katalog Produk", description: "Kami menyediakan katalog produk lengkap untuk memudahkan penjualan Anda." },
              { icon: "Megaphone", title: "Materi Promosi Digital", description: "Dapatkan materi promosi siap pakai untuk media sosial dan online shop." },
              { icon: "Truck", title: "Pengiriman ke seluruh Indonesia", description: "Layanan pengiriman ke seluruh wilayah Indonesia dengan aman." },
              { icon: "RefreshCw", title: "Peluang Repeat Order", description: "Produk berkualitas yang dipercaya pelanggan mendorong pembelian berulang." },
            ],
          },
        },
        {
          id: "faq",
          type: "FAQSection",
          props: {
            headline: "Pertanyaan Umum",
            items: [
              {
                question: "Bagaimana cara mendaftar sebagai reseller?",
                answer: "Hubungi kami melalui WhatsApp dan tim kami akan memandu proses pendaftaran Anda.",
              },
              {
                question: "Apakah ada minimal pembelian untuk reseller?",
                answer: "Ya, setiap paket reseller memiliki ketentuan minimal pembelian masing-masing. Hubungi kami untuk detail.",
              },
            ],
          },
        },
      ],
    },
  },
  contact: {
    title: "Halaman Kontak",
    craftJson: {
      blocks: [
        {
          id: "hero",
          type: "Hero",
          props: {
            headline: "Hubungi Kami",
            subheadline:
              "Kami siap membantu kebutuhan informasi produk maupun kerja sama reseller.",
            buttonText: "",
            buttonLink: "",
            bgImage: "",
            overlay: false,
          },
        },
      ],
    },
  },
};

async function ensureSystemPages() {
  for (const slug of SYSTEM_SLUGS) {
    const defaults = SYSTEM_PAGE_DEFAULTS[slug];
    await prisma.page.upsert({
      where: { slug },
      create: {
        slug,
        title: defaults.title,
        craftJson: defaults.craftJson,
        isPublished: true,
      },
      update: {},
    });
  }
}

export default async function PagesAdminPage() {
  await ensureSystemPages();

  const pages = await prisma.page.findMany({ orderBy: { createdAt: "asc" } });

  const systemPages = pages.filter((p) =>
    (SYSTEM_SLUGS as readonly string[]).includes(p.slug)
  );
  const customPages = pages.filter(
    (p) => !(SYSTEM_SLUGS as readonly string[]).includes(p.slug)
  );
  const orderedPages = [...systemPages, ...customPages];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Halaman CMS</h1>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg text-sm font-medium hover:bg-brand-brown transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Halaman
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Judul</th>
              <th className="text-left px-4 py-3 font-medium">URL</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Diperbarui</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Hardcoded Toko Reseller system entry */}
            <tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Globe className="w-2.5 h-2.5" /> Sistem
                  </span>
                  Halaman Toko Reseller
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">/toko-reseller</td>
              <td className="px-4 py-3">
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Published
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">—</td>
              <td className="px-4 py-3">
                <Link
                  href="/admin/reseller-stores"
                  className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                >
                  Kelola Toko
                </Link>
              </td>
            </tr>

            {orderedPages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Belum ada halaman
                </td>
              </tr>
            )}
            {orderedPages.map((page) => {
              const isSystem = (SYSTEM_SLUGS as readonly string[]).includes(page.slug);
              const publicUrl = page.slug === "home" ? "/" : isSystem ? `/${page.slug}` : `/p/${page.slug}`;
              return (
                <tr key={page.id} className={`hover:bg-gray-50/50 transition-colors ${isSystem ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {isSystem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Globe className="w-2.5 h-2.5" /> Sistem
                        </span>
                      )}
                      {page.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{publicUrl}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        page.isPublished
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(page.updatedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="text-brand-gold hover:text-brand-brown text-xs font-medium"
                      >
                        Edit
                      </Link>
                      {!isSystem && (
                        <DeletePageButton id={page.id} title={page.title} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1 text-amber-600"><Globe className="w-3 h-3" /> Sistem</span>
        {" "}= Halaman utama website yang dirender di URL tetap (/, /reseller, /contact).
        Perubahan langsung terlihat di website publik.
      </p>
    </div>
  );
}
