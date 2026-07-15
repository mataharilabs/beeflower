import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);
  return {
    title: settings?.metaTitle ?? settings?.siteName ?? "Bee & Flower Brand",
    description:
      settings?.metaDescription ??
      "Sabun berkualitas dengan aroma khas yang telah dipercaya lintas generasi sejak tahun 1928",
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
      shortcut: settings?.faviconUrl || "/favicon.ico",
      apple: settings?.faviconUrl || "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <html lang="id" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
        {children}
        {settings?.facebookPixelId && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${settings.facebookPixelId}');fbq('track','PageView');`,
            }}
          />
        )}
        {settings?.headerScripts && (
          <Script
            id="custom-header-scripts"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: settings.headerScripts }}
          />
        )}
        {settings?.footerScripts && (
          <Script
            id="custom-footer-scripts"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: settings.footerScripts }}
          />
        )}
      </body>
    </html>
  );
}
