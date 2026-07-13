import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const page = await prisma.page.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      craftJson: body.craftJson,
      isPublished: body.isPublished,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogImage: body.ogImage,
    },
  });
  revalidatePath(`/${page.slug}`);
  return NextResponse.json(page);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const page = await prisma.page.delete({ where: { id } });
  revalidatePath(`/${page.slug}`);
  return NextResponse.json({ success: true });
}
