import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Bee & Flower Brand",
};

export default async function LoginPage() {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" }, select: { logoUrl: true, logoWidth: true, siteName: true } })
    .catch(() => null);

  const logoWidth = settings?.logoWidth ?? 160;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          {settings?.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.siteName ?? "Bee & Flower Brand"}
              width={logoWidth}
              height={80}
              quality={100}
              className="mx-auto h-12 w-auto object-contain"
              style={{ maxWidth: `${logoWidth}px` }}
            />
          ) : (
            <h1 className="font-bold text-2xl text-brand-brown">
              .BEE <span className="text-brand-gold">&</span>FLOWER
            </h1>
          )}
          <p className="text-sm text-brand-beige mt-2">Masuk ke akun Anda</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
