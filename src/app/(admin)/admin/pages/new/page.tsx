import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export default async function NewPagePage() {
  const page = await prisma.page.create({
    data: {
      title: "Halaman Baru",
      slug: `halaman-baru-${Date.now()}`,
      craftJson: {},
    },
  });
  redirect(`/admin/pages/${page.id}`);
}
