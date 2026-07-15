import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Settings, ChevronRight } from "lucide-react";

export default async function MemberPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/member");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-brand-cream py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <h1 className="font-bold text-xl text-brand-brown">{user?.name}</h1>
                <p className="text-sm text-brand-beige">{user?.email}</p>
                {user?.phone && <p className="text-sm text-brand-beige">{user.phone}</p>}
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-brand-beige hover:text-red-500 transition-colors px-3 py-1.5 border border-brand-beige/40 rounded-lg"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        {/* Menu cards */}
        <h2 className="font-bold text-brand-brown mb-3 text-sm uppercase tracking-widest">Area Member</h2>
        <div className="space-y-3">
          <Link
            href="/member/orders"
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-11 h-11 bg-brand-cream rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/10 transition-colors">
              <Package className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-brand-brown">Pesanan Saya</h3>
              <p className="text-sm text-brand-beige mt-0.5">Lihat riwayat dan status pesanan</p>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-beige group-hover:text-brand-gold transition-colors" />
          </Link>

          <Link
            href="/member/settings"
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-11 h-11 bg-brand-cream rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/10 transition-colors">
              <Settings className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-brand-brown">Pengaturan Akun</h3>
              <p className="text-sm text-brand-beige mt-0.5">Ubah nama, telepon, dan password</p>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-beige group-hover:text-brand-gold transition-colors" />
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/toko" className="text-sm text-brand-gold hover:underline">
            Ke Toko →
          </Link>
        </div>
      </div>
    </div>
  );
}
