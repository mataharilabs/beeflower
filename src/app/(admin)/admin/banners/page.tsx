import { prisma } from "@/lib/prisma";
import { BannersClient } from "@/components/admin/BannersClient";

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
      </div>
      <BannersClient initialBanners={banners} />
    </div>
  );
}
