import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberSidebar } from "@/components/member/MemberSidebar";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/member/");

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4">
      <div className="max-w-5xl mx-auto flex gap-6 items-start">
        <MemberSidebar userName={session.user?.name} userEmail={session.user?.email} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
