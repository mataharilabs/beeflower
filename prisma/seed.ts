import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@beeflower.com" },
    update: {},
    create: {
      email: "admin@beeflower.com",
      name: "Admin Bee & Flower",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created: admin@beeflower.com / admin123");

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Bee & Flower Brand",
      metaTitle: "Bee & Flower Brand - Sabun Berkualitas Sejak 1928",
      metaDescription:
        "Sabun berkualitas dengan aroma khas yang telah dipercaya lintas generasi sejak tahun 1928",
      whatsapp: "6285175273181",
      email: "beeandflower899@gmail.com",
      address:
        "Jl. Karet No.45, Bongkaran\nKOTA SURABAYA, PABEAN CANTIKAN,\nJAWA TIMUR, ID, 60161",
      businessHours:
        "Senin - Jumat : 09.00 - 17.00 WIB\nSabtu : 09.00 - 15.00 WIB\nMinggu & hari Libur Tutup",
      instagram: "beefloweroffical",
      tiktok: "beefloweroffical",
    },
  });
  console.log("✅ Site settings created");

  // Payment settings
  await prisma.paymentSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      xenditEnabled: false,
      manualTransferEnabled: true,
    },
  });
  console.log("✅ Payment settings created");

  // Sample bank accounts
  await prisma.bankAccount.createMany({
    data: [
      {
        bankName: "BCA",
        accountHolder: "Bee & Flower Brand",
        accountNumber: "1234567890",
        isActive: true,
        order: 0,
      },
      {
        bankName: "BRI",
        accountHolder: "Bee & Flower Brand",
        accountNumber: "0987654321",
        isActive: true,
        order: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Bank accounts created");

  // Sample categories
  const soapCategory = await prisma.category.upsert({
    where: { slug: "sabun-batang" },
    update: {},
    create: { name: "Sabun Batang", slug: "sabun-batang" },
  });
  const liquidCategory = await prisma.category.upsert({
    where: { slug: "sabun-cair" },
    update: {},
    create: { name: "Sabun Cair", slug: "sabun-cair" },
  });
  console.log("✅ Categories created");

  // Sample products
  const products = [
    {
      name: "Bee & Flower Sandalwood 125 Gr",
      slug: "bee-flower-sandalwood-125gr",
      shortDesc: "Keharuman aroma cendana yang hangat dan elegan",
      description:
        "Bee & Flower Sandalwood menghadirkan pengalaman mandi yang menenangkan dengan aroma cendana yang hangat dan elegan. Formula lembut membersihkan kulit dengan nyaman.",
      price: 67000,
      comparePrice: null,
      stock: 100,
      images: ["/images/products/sandalwood.jpg"],
      isFeatured: true,
      isBestSeller: true,
      categoryId: soapCategory.id,
      metaTitle: "Bee & Flower Sandalwood 125 Gr - Sabun Aroma Cendana",
      metaDescription:
        "Sabun Bee & Flower Sandalwood dengan aroma cendana hangat dan elegan. Formula lembut untuk kulit nyaman.",
    },
    {
      name: "Bee & Flower Rose 125 Gr",
      slug: "bee-flower-rose-125gr",
      shortDesc: "Nuansa bunga mawar yang lembut dan menyegarkan",
      description:
        "Bee & Flower Rose hadir dengan nuansa bunga mawar yang lembut dan menyegarkan. Cocok untuk pengalaman mandi yang lebih romantis dan feminin.",
      price: 67000,
      stock: 80,
      images: ["/images/products/rose.jpg"],
      isFeatured: true,
      isBestSeller: true,
      categoryId: soapCategory.id,
    },
    {
      name: "Bee & Flower Jasmine 125 Gr",
      slug: "bee-flower-jasmine-125gr",
      shortDesc: "Aroma melati yang ringan dengan kesan bersih dan alami",
      description:
        "Bee & Flower Jasmine menghadirkan aroma melati yang ringan dan menyejukkan untuk pengalaman mandi yang menyenangkan setiap hari.",
      price: 67000,
      stock: 90,
      images: ["/images/products/jasmine.jpg"],
      isFeatured: true,
      isBestSeller: true,
      categoryId: soapCategory.id,
    },
    {
      name: "Bee & Flower Liquid Soap 650 ml",
      slug: "bee-flower-liquid-soap-650ml",
      shortDesc: "Praktis digunakan setiap hari dengan formula lembut",
      description:
        "Bee & Flower Liquid Soap hadir dalam kemasan praktis 650ml. Formula lembut yang cocok untuk penggunaan sehari-hari seluruh keluarga.",
      price: 98000,
      stock: 60,
      images: ["/images/products/liquid-soap.jpg"],
      isFeatured: true,
      isBestSeller: true,
      categoryId: liquidCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("✅ Sample products created");

  // Sample banners
  await prisma.banner.createMany({
    data: [
      {
        image: "/images/banners/hero-1.jpg",
        headline:
          "Keharuman Klasik\nyang Tetap Dicintai\nHingga Kini",
        subheadline:
          "Rasakan pengalaman mandi yang lebih istimewa dengan Bee & Flower. Sabun berkualitas dengan aroma khas yang menjadi pilihan berbagai generasi.",
        buttonText: "BELANJA SEKARANG",
        buttonLink: "/toko",
        order: 0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Sample banners created");

  // Reseller packages
  await prisma.resellerPackage.createMany({
    data: [
      {
        name: "Paket Reseller Starter",
        price: 4212000,
        originalPrice: 5616000,
        description: "Paket terbaik untuk memulai bisnis reseller Bee & Flower",
        items: [
          "1 CTN Bee & Flower Sandalwood 125 Gr (144 Pcs)",
          "1 CTN Bee & Flower Sandalwood 650 Ml (12 Pcs)",
          "1 CTN Shanghai Sulfur Soap 100 Gr (72 Pcs)",
        ],
        isActive: true,
        order: 0,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Reseller packages created");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
