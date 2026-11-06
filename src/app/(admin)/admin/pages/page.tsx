import { prisma } from "@/lib/prisma";
import { PagesClient } from "@/components/admin/PagesClient";

const SYSTEM_SLUGS = ["home", "reseller", "contact", "toko", "toko-reseller"] as const;

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
            subSubheadline: "Bergabunglah Bersama Kami",
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
            bgType: "color",
            bgImage: "",
            bgColor: "",
            overlayEnabled: false,
            overlayColor: "#000000",
            overlayOpacity: 40,
          },
        },
      ],
    },
  },
  "toko-reseller": {
    title: "Halaman Toko Reseller",
    craftJson: {
      blocks: [
        {
          id: "toko-reseller-hero",
          type: "Hero",
          props: {
            headline: "Toko Reseller Bee & Flower Brand",
            subheadline: "Temukan reseller Bee & Flower Brand terdekat di kotamu. Cari berdasarkan provinsi atau kota untuk menemukan produk asli berkualitas.",
            buttonText: "",
            buttonLink: "",
            bgType: "color",
            bgColor: "#3A2D1D",
            overlayEnabled: false,
            overlayColor: "#000000",
            overlayOpacity: 40,
          },
        },
      ],
    },
  },
  toko: {
    title: "Halaman Toko / Produk",
    craftJson: {
      blocks: [
        {
          id: "toko-hero",
          type: "Hero",
          props: {
            headline: "Produk Kami",
            subheadline: "Temukan produk Bee & Flower pilihan terbaik Anda",
            buttonText: "",
            buttonLink: "",
            bgType: "color",
            bgImage: "",
            bgColor: "#3A2D1D",
            overlayEnabled: false,
            overlayColor: "#000000",
            overlayOpacity: 40,
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

  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, slug: true, isPublished: true, updatedAt: true },
  });

  const tokoResellerPage = pages.find((p) => p.slug === "toko-reseller");

  // Serialize dates for client component
  const serialized = pages.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <PagesClient
      pages={serialized}
      tokoResellerPageId={tokoResellerPage?.id ?? null}
    />
  );
}
