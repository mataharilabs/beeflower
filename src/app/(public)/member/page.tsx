import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default async function MemberPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="font-bold text-xl text-brand-brown mb-1">
          Selamat Datang, {user?.name}!
        </h1>
        <p className="text-sm text-brand-beige">
          Member sejak{" "}
          {user?.createdAt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {user?.phone && <p className="text-sm text-brand-beige mt-1">{user.phone}</p>}
        {session?.user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-brand-gold hover:text-brand-brown font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Anda adalah Admin — Masuk ke Admin Panel
          </Link>
        )}
      </div>
      <div className="text-center">
        <Link href="/toko" className="text-sm text-brand-gold hover:underline">
          Ke Toko →
        </Link>
      </div>
    </div>
  );
}
