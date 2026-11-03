import { ArrowRight, Code2, Ruler } from "lucide-react";
import Link from "next/link";
import { ProjectGrid } from "@/components/projets/project-card";
import { ServiceLink } from "@/components/services/service-card";
import { Testimonials } from "@/components/testimonials";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CtaBanner } from "@/components/ui/cta-banner";
import { Section } from "@/components/ui/section";
import { siteConfig, type Category } from "@/config/site";
import { getRecentProjects, getServices, getTestimonials } from "@/lib/content";
import { toProjectSummary } from "@/lib/content-types";

const panels: Array<{
  category: Category;
  icon: typeof Code2;
  text: string;
  cta: string;
}> = [
  {
    category: "dev",
    icon: Code2,
    text: "Sites, applications et analyses de données : des outils clairs, rapides et utiles.",
    cta: "Découvrir Carles",
  },
  {
    category: "architecture",
    icon: Ruler,
    text: "Plans, modélisation 3D et aménagement : donner forme à vos espaces avant les travaux.",
    cta: "Découvrir Gédéon",
  },
];

export default function HomePage() {
  const recent = getRecentProjects(3).map(toProjectSummary);
  const services = {
    dev: getServices("dev").slice(0, 3),
    architecture: getServices("architecture").slice(0, 3),
  };

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-titre" className="pt-16 pb-12 sm:pt-24 sm:pb-16">
        <Container>
          <p className="mb-6 text-sm font-semibold tracking-wider text-muted uppercase">
            {siteConfig.name} · {siteConfig.baseline}
          </p>
          <h1 id="hero-titre" className="max-w-4xl text-display">
            Deux ingénieurs, deux regards, <span className="italic">un studio.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lead text-muted">
            Du code et des données d&apos;un côté, des plans et des volumes de l&apos;autre.
          </p>
        </Container>
      </section>

      {/* Écran partagé */}
      <Container size="wide" className="pb-8">
        <ul className="grid gap-4 md:grid-cols-2">
          {panels.map(({ category, icon: Icon, text, cta }) => {
            const meta = siteConfig.categories[category];
            const person = siteConfig.people[category];
            return (
              <li key={category} className={`accent-${category}`}>
                <Link
                  href={`/${category}`}
                  className="group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl bg-accent-soft p-8 transition-shadow hover:shadow-lift sm:p-10"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -bottom-16 size-64 rounded-full bg-accent opacity-15 transition-transform duration-700 motion-safe:group-hover:scale-125"
                  />
                  <div className="relative">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <h2 className="mt-6 text-h2">{meta.label}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {person.firstName} · {person.goal}
                    </p>
                    <p className="mt-4 max-w-md text-lead">{text}</p>
                  </div>
                  <span className="relative mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-accent px-5 font-medium text-accent-contrast">
                    {cta}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>

      {/* Projets récents */}
      <Section
        id="projets-recents"
        eyebrow="Portfolio"
        title="Projets récents"
        action={
          <Button href="/projets" variant="secondary" size="sm">
            Tous les projets
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        }
      >
        <ProjectGrid projects={recent} />
      </Section>

      {/* Services */}
      <Section
        id="services"
        eyebrow="Services"
        title="Ce que nous proposons"
        intro="Des offres claires, avec des tarifs indicatifs et un devis gratuit."
        tone="muted"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {(["dev", "architecture"] as const).map((domain) => (
            <div
              key={domain}
              className={`accent-${domain} rounded-3xl border border-border bg-surface p-6 sm:p-8`}
            >
              <h3 className="text-h3">{siteConfig.categories[domain].servicesLabel}</h3>
              <ul className="mt-4">
                {services[domain].map((service) => (
                  <li key={service.slug}>
                    <ServiceLink service={service} />
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${domain}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-text underline-offset-4 hover:underline"
              >
                Toutes les offres {siteConfig.categories[domain].servicesLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Témoignages */}
      <Section
        id="temoignages"
        eyebrow="Témoignages (exemples)"
        title="Ils nous ont fait confiance"
      >
        <Testimonials items={getTestimonials()} />
      </Section>

      <CtaBanner />
    </>
  );
}
