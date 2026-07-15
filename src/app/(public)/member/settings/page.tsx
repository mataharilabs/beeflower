import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SettingsForm } from "@/components/member/SettingsForm";

export default async function MemberSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/member/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <div className="min-h-screen bg-brand-cream py-10">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/member"
            className="p-2 text-brand-beige hover:text-brand-brown transition-colors -ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-xl text-brand-brown">Pengaturan Akun</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <SettingsForm user={user ?? { name: null, email: null, phone: null }} />
        </div>
      </div>
    </div>
  );
}
