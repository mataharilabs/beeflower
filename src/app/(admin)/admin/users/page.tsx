import { prisma } from "@/lib/prisma";
import { UsersClient } from "@/components/admin/UsersClient";

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
    take: 500,
  });

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    _count: u._count,
  }));

  return <UsersClient initialUsers={serialized} />;
}
