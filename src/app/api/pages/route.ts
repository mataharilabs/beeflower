import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const page = await prisma.page.create({
    data: {
      title: body.title,
      slug: body.slug,
      craftJson: body.craftJson ?? {},
      isPublished: body.isPublished ?? false,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogImage: body.ogImage,
    },
  });
  revalidatePath(`/${page.slug}`);
  return NextResponse.json(page, { status: 201 });
}
