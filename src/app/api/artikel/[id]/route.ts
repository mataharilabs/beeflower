import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  const { title, slug, excerpt, content, coverImage, status, categoryId, metaTitle, metaDescription } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  if (slug && slug !== existing.slug) {
    const slugConflict = await prisma.article.findUnique({ where: { slug } });
    if (slugConflict) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }
  }

  const wasPublished = existing.status === "PUBLISHED";
  const isPublishing = status === "PUBLISHED" && !wasPublished;

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: title.trim(),
      slug: slug?.trim() || existing.slug,
      excerpt: excerpt?.trim() || null,
      content: content || "",
      coverImage: coverImage || null,
      status: status || existing.status,
      categoryId: categoryId || null,
      metaTitle: metaTitle?.trim() || null,
      metaDescription: metaDescription?.trim() || null,
      publishedAt: isPublishing ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json(article);
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
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });

  if (existing.status === "TRASH") {
    // Hard delete if already in trash
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  // Move to trash
  await prisma.article.update({ where: { id }, data: { status: "TRASH" } });
  return NextResponse.json({ trashed: true });
}
