import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { creativeWorkJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { ProjectGrid } from "@/components/projets/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LightboxGallery } from "@/components/ui/lightbox";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { getProject, getProjects, getRelatedProjects } from "@/lib/content";
import { toProjectSummary } from "@/lib/content-types";

// Tous les projets connus sont prérendus (generateStaticParams). Un slug inconnu mène à une 404,
// rendue à la demande : la navigation peut donc légitimement attendre le serveur.
export const instant = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projets/${project.slug}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const meta = siteConfig.categories[project.category];
  const related = getRelatedProjects(project).map(toProjectSummary);

  return (
    <article className={`accent-${project.category}`}>
      <JsonLd data={creativeWorkJsonLd(project)} />
      <header className="pt-10 pb-12 sm:pt-16">
        <Container>
          <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/projets" className="inline-flex items-center gap-1 hover:text-fg">
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Projets
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/projets?categorie=${project.category}`} className="hover:text-fg">
                  {meta.label}
                </Link>
              </li>
            </ol>
          </nav>
          <Badge tone="accent">{meta.label}</Badge>
          <h1 className="mt-5 max-w-4xl text-h1">{project.title}</h1>
          <p className="mt-5 max-w-3xl text-lead text-muted">{project.summary}</p>

          <dl className="mt-10 grid gap-6 border-y border-border py-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Année</dt>
              <dd className="mt-1 font-medium">{project.year}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Rôle</dt>
              <dd className="mt-1 font-medium">{project.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Outils et thèmes</dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag}>
                      <Link href={`/projets?tag=${encodeURIComponent(tag)}`}>
                        <Badge className="hover:border-fg hover:text-fg">{tag}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </Container>
      </header>

      <Container size="wide">
        <Image
          src={project.cover}
          alt={`Visuel principal du projet ${project.title}`}
          width={1600}
          height={1000}
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="h-auto w-full rounded-3xl border border-border"
        />
      </Container>

      <Container className="grid gap-12 py-16 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <MdxContent source={project.body} />
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {project.link && (
            <Button href={project.link.url} external variant="secondary">
              {project.link.label}
              <ExternalLink aria-hidden="true" className="size-4" />
              <span className="sr-only"> (nouvel onglet)</span>
            </Button>
          )}
          <div className="rounded-2xl bg-accent-soft p-6">
            <p className="font-display text-xl">Envie d&apos;un projet similaire ?</p>
            <p className="mt-2 text-sm text-muted">
              Décrivez-nous votre besoin, nous vous répondons {siteConfig.contact.responseTime}.
            </p>
            <Button href="/contact" className="mt-4 w-full">
              Un projet comme celui-ci ?
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </aside>
      </Container>

      {project.gallery.length > 0 && (
        <Section id="galerie" title="Galerie" tone="muted">
          <LightboxGallery label={`Galerie du projet ${project.title}`} images={project.gallery} />
        </Section>
      )}

      {related.length > 0 && (
        <Section id="similaires" title="Projets similaires">
          <ProjectGrid projects={related} />
        </Section>
      )}
    </article>
  );
}
