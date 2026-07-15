import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

const DEFAULT_MENU_LINKS = [
  { href: "/", label: "Home", newTab: false },
  { href: "/reseller", label: "Our Story", newTab: false },
  { href: "/reseller", label: "Reseller", newTab: false },
  { href: "/contact", label: "Contact", newTab: false },
  { href: "/toko", label: "Store", newTab: false },
];

const DEFAULT_INFO_LINKS = [
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi", newTab: false },
  { href: "/syarat-ketentuan", label: "Syarat & Ketentuan", newTab: false },
  { href: "/pengiriman", label: "Pengiriman", newTab: false },
  { href: "/faq", label: "FAQ", newTab: false },
];

export async function Footer() {
  const [settings, footerMain, footerInfo] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.navItem
      .findMany({ where: { location: "FOOTER_MAIN", isActive: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.navItem
      .findMany({ where: { location: "FOOTER_INFO", isActive: true }, orderBy: { order: "asc" } })
      .catch(() => []),
  ]);

  const whatsapp = settings?.whatsapp ?? "6285175273181";
  const whatsappDisplay = whatsapp.replace("62", "0").replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  const instagram = settings?.instagram ?? "beefloweroffical";
  const tiktok = settings?.tiktok ?? "beefloweroffical";
  const shopee = settings?.shopee ?? null;
  const tokopedia = settings?.tokopedia ?? null;
  const siteName = settings?.siteName ?? "Bee & Flower Brand";

  const menuLinks = footerMain.length > 0 ? footerMain : DEFAULT_MENU_LINKS;
  const infoLinks = footerInfo.length > 0 ? footerInfo : DEFAULT_INFO_LINKS;

  return (
    <footer className="bg-brand-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              {settings?.logoLightUrl ? (
                <Image
                  src={settings.logoLightUrl}
                  alt={siteName}
                  width={240}
                  height={96}
                  quality={100}
                  className="h-12 w-auto object-contain"
                />
              ) : settings?.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={siteName}
                  width={240}
                  height={96}
                  quality={100}
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <span className="font-bold text-xl tracking-wide leading-tight">
                  .BEE <span className="text-brand-gold">&</span>FLOWER BRAND
                  <span className="block text-[10px] font-medium tracking-widest text-brand-beige mt-0.5">
                    Since 1928
                  </span>
                </span>
              )}
            </div>
            <p className="text-sm text-brand-beige leading-relaxed mb-6">
              Sabun berkualitas dengan aroma khas yang telah dipercaya lintas generasi
              sejak tahun 1928
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-beige hover:text-white hover:border-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href={`https://tiktok.com/@${tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-brand-beige flex items-center justify-center text-brand-beige hover:text-white hover:border-white transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-brand-gold">
              Menu
            </h4>
            <ul className="space-y-2.5">
              {menuLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    target={link.newTab ? "_blank" : undefined}
                    rel={link.newTab ? "noopener noreferrer" : undefined}
                    className="text-sm text-brand-beige hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-brand-gold">
              Informasi
            </h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    target={link.newTab ? "_blank" : undefined}
                    rel={link.newTab ? "noopener noreferrer" : undefined}
                    className="text-sm text-brand-beige hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Store + Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-brand-gold">
                Official Store
              </h4>
              <ul className="space-y-2.5">
                {instagram && (
                  <li>
                    <a
                      href={`https://instagram.com/${instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      {instagram}
                    </a>
                  </li>
                )}
                {tiktok && (
                  <li>
                    <a
                      href={`https://tiktok.com/@${tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
                      </svg>
                      {tiktok}
                    </a>
                  </li>
                )}
                {shopee && (
                  <li>
                    <a
                      href={`https://shopee.co.id/${shopee}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      {shopee}
                    </a>
                  </li>
                )}
                {tokopedia && (
                  <li>
                    <a
                      href={`https://tokopedia.com/${tokopedia}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {tokopedia}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-4 text-brand-gold">
                Hubungi Kami
              </h4>
              <a
                href={`https://wa.me/${whatsapp}`}
                className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {whatsappDisplay}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-brand-beige">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
