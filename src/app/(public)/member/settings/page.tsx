import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/member/SettingsForm";

export default async function MemberSettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <>
      <h1 className="font-bold text-xl text-brand-brown mb-4">Pengaturan Akun</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <SettingsForm user={user ?? { name: null, email: null, phone: null }} />
      </div>
    </>
  );
}
