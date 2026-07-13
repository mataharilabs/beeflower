import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageEditorWrapper } from "@/components/admin/PageEditorWrapper";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <PageEditorWrapper
      pageId={page.id}
      initialTitle={page.title}
      initialSlug={page.slug}
      initialCraftJson={page.craftJson as object}
      initialPublished={page.isPublished}
      initialMeta={{
        metaTitle: page.metaTitle ?? "",
        metaDescription: page.metaDescription ?? "",
        ogImage: page.ogImage ?? "",
      }}
    />
  );
}
