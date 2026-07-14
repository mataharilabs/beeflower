import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, headerNav, ctaItems] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.navItem
      .findMany({ where: { location: "HEADER_NAV", isActive: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.navItem
      .findMany({ where: { location: "HEADER_CTA", isActive: true }, orderBy: { order: "asc" }, take: 1 })
      .catch(() => []),
  ]);

  if (settings?.maintenanceMode) {
    redirect("/maintenance");
  }

  return (
    <>
      <Header
        logoUrl={settings?.logoUrl}
        siteName={settings?.siteName}
        navLinks={headerNav.length > 0 ? headerNav : undefined}
        ctaButton={ctaItems[0] ?? null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
