import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import { ProjectGrid } from "@/components/projets/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LightboxGallery } from "@/components/ui/lightbox";
import { Section } from "@/components/ui/section";
import { Timeline } from "@/components/ui/timeline";
import { siteConfig, type Category } from "@/config/site";
import { getProfile, getProjects } from "@/lib/content";
import { toProjectSummary } from "@/lib/content-types";

/** Page de profil partagée par /dev (Carles) et /architecture (Gédéon). */
export function ProfilePage({ category }: { category: Category }) {
  const person = siteConfig.people[category];
  const meta = siteConfig.categories[category];
  const profile = getProfile(category);
  const projects = getProjects(category);

  return (
    <div className={`accent-${category}`}>
      {/* Présentation */}
      <section aria-labelledby="profil-titre" className="pt-12 pb-16 sm:pt-20 sm:pb-24">
        <Container className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <Badge tone="accent">{meta.label}</Badge>
            <h1 id="profil-titre" className="mt-5 text-h1">
              {person.firstName}
            </h1>
            <p className="mt-3 font-display text-h3">{person.title}</p>
            <p className="mt-2 font-semibold text-accent-text">{person.goal}</p>
            <p className="mt-6 max-w-xl text-lead text-muted">{profile.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/services/${category}`}>
                {category === "dev" ? "Voir les services dev" : "Voir les services architecture"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button href={person.cv} variant="secondary" download>
                <Download aria-hidden="true" className="size-4" />
                Télécharger le CV
                <span className="sr-only"> (PDF d&apos;exemple)</span>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-accent-soft"
            />
            <Image
              src={`/demo/portrait-${category}.svg`}
              alt={`Portrait de ${person.firstName} (image d'exemple)`}
              width={800}
              height={1000}
              priority
              className="h-auto w-full rounded-3xl border border-border shadow-soft"
            />
          </div>
        </Container>
      </section>

      {/* Compétences */}
      <Section id="competences" title="Compétences" tone="muted">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {profile.skills.map((group) => (
            <li key={group.group} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-sans text-sm font-semibold tracking-wider text-accent-text uppercase">
                {group.group}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge className="px-3 py-1 text-sm">{item}</Badge>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      {/* Parcours */}
      <Section id="parcours" title="Parcours" containerSize="narrow">
        <Timeline items={profile.timeline} />
      </Section>

      {/* Projets */}
      <Section
        id="projets"
        title="Projets"
        tone="muted"
        intro={
          category === "architecture"
            ? "Une sélection de plans, coupes et rendus. Cliquez sur une image pour l'agrandir."
            : "Applications, analyses et outils réalisés en cours, en stage ou pour des clients."
        }
        action={
          <Button href={`/projets?categorie=${category}`} variant="secondary" size="sm">
            Tous les projets {meta.label}
          </Button>
        }
      >
        <ProjectGrid projects={projects.map(toProjectSummary)} />
      </Section>

      {category === "architecture" && (
        <Section
          id="galerie"
          title="Galerie"
          intro="Les visuels de tous les projets, en grand format."
        >
          <LightboxGallery
            label="Galerie des projets d'architecture"
            layout="large"
            images={projects.flatMap((project) =>
              project.gallery.map((image) => ({
                src: image.src,
                alt: image.alt,
                caption: `${project.title} — ${image.caption ?? image.alt}`,
              })),
            )}
          />
        </Section>
      )}
    </div>
  );
}
