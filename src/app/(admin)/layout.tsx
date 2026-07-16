import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" }, select: { logoUrl: true, logoWidth: true, siteName: true } })
    .catch(() => null);

  return (
    <AdminShell
      logoUrl={settings?.logoUrl}
      logoWidth={settings?.logoWidth}
      siteName={settings?.siteName}
    >
      {children}
    </AdminShell>
  );
}
