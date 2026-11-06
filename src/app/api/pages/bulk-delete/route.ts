import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SYSTEM_SLUGS = ["home", "reseller", "contact", "toko", "toko-reseller"];

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  // Fetch pages to validate — never delete system pages
  const pages = await prisma.page.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });

  const deletableIds = pages
    .filter((p) => !SYSTEM_SLUGS.includes(p.slug))
    .map((p) => p.id);

  if (deletableIds.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  await prisma.page.deleteMany({ where: { id: { in: deletableIds } } });

  revalidatePath("/admin/pages");

  return NextResponse.json({ deleted: deletableIds.length });
}
