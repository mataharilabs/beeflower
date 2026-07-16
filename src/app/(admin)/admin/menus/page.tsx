import { prisma } from "@/lib/prisma";
import { MenusClient } from "@/components/admin/MenusClient";

const DEFAULT_ITEMS = [
  // Header Nav
  { label: "Home", href: "/", location: "HEADER_NAV" as const, order: 0 },
  { label: "Reseller", href: "/reseller", location: "HEADER_NAV" as const, order: 1 },
  { label: "Toko", href: "/toko", location: "HEADER_NAV" as const, order: 2 },
  { label: "Contact", href: "/contact", location: "HEADER_NAV" as const, order: 3 },
  // Header CTA
  { label: "BELANJA SEKARANG", href: "/toko", location: "HEADER_CTA" as const, order: 0 },
  // Footer Main
  { label: "Home", href: "/", location: "FOOTER_MAIN" as const, order: 0 },
  { label: "Our Story", href: "/reseller", location: "FOOTER_MAIN" as const, order: 1 },
  { label: "Reseller", href: "/reseller", location: "FOOTER_MAIN" as const, order: 2 },
  { label: "Contact", href: "/contact", location: "FOOTER_MAIN" as const, order: 3 },
  { label: "Store", href: "/toko", location: "FOOTER_MAIN" as const, order: 4 },
  // Footer Info
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi", location: "FOOTER_INFO" as const, order: 0 },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan", location: "FOOTER_INFO" as const, order: 1 },
  { label: "Pengiriman", href: "/pengiriman", location: "FOOTER_INFO" as const, order: 2 },
  { label: "FAQ", href: "/faq", location: "FOOTER_INFO" as const, order: 3 },
];

async function ensureDefaultMenuItems() {
  const locations = ["HEADER_NAV", "HEADER_CTA", "FOOTER_MAIN", "FOOTER_INFO"] as const;
  for (const location of locations) {
    const count = await prisma.navItem.count({ where: { location } });
    if (count === 0) {
      const defaults = DEFAULT_ITEMS.filter((i) => i.location === location);
      await prisma.navItem.createMany({ data: defaults });
    }
  }
}

export default async function MenusPage() {
  await ensureDefaultMenuItems();

  const items = await prisma.navItem.findMany({
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Navigation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola menu header dan footer website
        </p>
      </div>
      <MenusClient initialItems={items} />
    </div>
  );
}
