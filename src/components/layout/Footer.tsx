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

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" />
    </svg>
  );
}

function ShopeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6C4.9 6 4 6.9 4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2H10c0-1.1.9-2 2-2zm6 14H6V8h12v10z" />
      <circle cx="12" cy="14" r="2.5" />
    </svg>
  );
}

function TokopediaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="currentColor">
      <path fillRule="evenodd" d="M96 28c-9.504 0-17.78 5.307-22.008 13.127C82.736 42.123 88.89 44 96 47.332c7.11-3.332 13.264-5.209 22.008-6.205C113.781 33.31 105.506 28 96 28Zm0-12c-15.973 0-29.568 10.117-34.754 24.28C52.932 40 42.462 40 28.53 40H28a6 6 0 0 0-6 6v124a6 6 0 0 0 6 6h92c27.614 0 50-22.386 50-50V46a6 6 0 0 0-6-6h-.531c-13.931 0-24.401 0-32.715.28C125.566 26.113 111.97 16 96 16ZM34 52.001V164h86c20.987 0 38-17.013 38-38V52.001c-18.502.009-29.622.098-37.872.966-8.692.915-13.999 2.677-21.445 6.4a6 6 0 0 1-5.366 0c-7.446-3.723-12.753-5.485-21.445-6.4-8.25-.868-19.37-.957-37.872-.966ZM50 96c0-9.941 8.059-18 18-18s18 8.059 18 18-8.059 18-18 18-18-8.059-18-18Zm18-30c-16.569 0-30 13.431-30 30 0 16.569 13.431 30 30 30 1.126 0 2.238-.062 3.332-.183l20.425 20.426a6 6 0 0 0 8.486 0l20.425-20.426c1.094.121 2.206.183 3.332.183 16.569 0 30-13.431 30-30 0-16.569-13.431-30-30-30-12.764 0-23.666 7.971-28 19.207C91.666 73.971 80.764 66 68 66Zm40.082 55.433A30.1 30.1 0 0 1 96 106.793a30.101 30.101 0 0 1-12.082 14.64L96 133.515l12.082-12.082ZM124 78c-9.941 0-18 8.059-18 18s8.059 18 18 18 18-8.059 18-18-8.059-18-18-18ZM76 96a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm48 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" clipRule="evenodd" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
  const logoLightWidth = settings?.logoLightWidth ?? settings?.logoWidth ?? 240;
  const logoWidth = settings?.logoWidth ?? 240;

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
                  width={logoLightWidth}
                  height={96}
                  quality={100}
                  className="h-12 w-auto object-contain"
                  style={{ maxWidth: `${logoLightWidth}px` }}
                />
              ) : settings?.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={siteName}
                  width={logoWidth}
                  height={96}
                  quality={100}
                  className="h-12 w-auto object-contain brightness-0 invert"
                  style={{ maxWidth: `${logoWidth}px` }}
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

            {/* Social icon circles — all 5 platforms */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-brand-beige hover:text-[#E1306C] hover:border-[#E1306C] transition-colors"
                aria-label="Instagram"
              >
                <IgIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://tiktok.com/@${tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-brand-beige hover:text-white hover:border-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              {shopee && (
                <a
                  href={`https://shopee.co.id/${shopee}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-brand-beige hover:text-[#EE4D2D] hover:border-[#EE4D2D] transition-colors"
                  aria-label="Shopee"
                >
                  <ShopeeIcon className="w-4 h-4" />
                </a>
              )}
              {tokopedia && (
                <a
                  href={`https://tokopedia.com/${tokopedia}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-brand-beige hover:text-[#03AC0E] hover:border-[#03AC0E] transition-colors"
                  aria-label="Tokopedia"
                >
                  <TokopediaIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-brand-beige hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
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
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors group"
                    >
                      <IgIcon className="w-4 h-4 flex-shrink-0 text-[#E1306C]" />
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
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors group"
                    >
                      <TikTokIcon className="w-4 h-4 flex-shrink-0 text-white/80" />
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
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors group"
                    >
                      <ShopeeIcon className="w-4 h-4 flex-shrink-0 text-[#EE4D2D]" />
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
                      className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors group"
                    >
                      <TokopediaIcon className="w-4 h-4 flex-shrink-0 text-[#03AC0E]" />
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
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-beige hover:text-white transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0 text-[#25D366]" />
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
