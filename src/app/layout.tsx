import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
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
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
        {children}
      </body>
    </html>
  );
}
