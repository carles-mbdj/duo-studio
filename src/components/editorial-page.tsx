import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { Container } from "@/components/ui/container";
import { getPage } from "@/lib/content";

export function editorialMetadata(slug: string): Metadata {
  const page = getPage(slug);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: `/${slug}` });
}

/** Page éditoriale simple rendue depuis content/pages/<slug>.mdx. */
export function EditorialPage({ slug }: { slug: string }) {
  const page = getPage(slug);
  if (!page) notFound();
  return (
    <article className="py-16 sm:py-24">
      <Container size="narrow">
        <h1 className="text-h1">{page.title}</h1>
        <p className="mt-4 text-lead text-muted">{page.description}</p>
        {page.updatedAt && (
          <p className="mt-2 text-sm text-muted">Dernière mise à jour : {page.updatedAt}</p>
        )}
        <MdxContent source={page.body} className="mt-12" />
      </Container>
    </article>
  );
}
