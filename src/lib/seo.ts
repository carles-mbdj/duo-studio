import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Project } from "./content";

/** URL absolue à partir d'un chemin du site. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Métadonnées d'une page : titre, description, URL canonique, Open Graph et Twitter.
 * L'image Open Graph est fournie par les fichiers opengraph-image.tsx (générée dynamiquement).
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/* ---------------------------------------------------------------------------
 * Données structurées (JSON-LD, schema.org)
 * ------------------------------------------------------------------------- */

const organizationId = absoluteUrl("/#studio");

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": organizationId,
    name: siteConfig.name,
    description: siteConfig.description,
    slogan: siteConfig.baseline,
    url: absoluteUrl("/"),
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.contact.city,
      addressCountry: "FR",
    },
    areaServed: "FR",
    sameAs: siteConfig.social.map((item) => item.href),
    founder: (["dev", "architecture"] as const).map((category) => ({
      "@type": "Person",
      name: siteConfig.people[category].firstName,
    })),
  };
}

export function personJsonLd(category: "dev" | "architecture", skills: string[]) {
  const person = siteConfig.people[category];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.firstName,
    jobTitle: person.title,
    description: person.goal,
    url: absoluteUrl(`/${category}`),
    image: absoluteUrl(`/demo/portrait-${category}.svg`),
    knowsAbout: skills,
    worksFor: { "@id": organizationId },
  };
}

export function creativeWorkJsonLd(project: Project) {
  const author = siteConfig.people[project.category];
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    abstract: project.summary,
    url: absoluteUrl(`/projets/${project.slug}`),
    image: absoluteUrl(`/projets/${project.slug}/opengraph-image`),
    dateCreated: String(project.year),
    keywords: project.tags.join(", "),
    genre: siteConfig.categories[project.category].label,
    inLanguage: "fr-FR",
    author: { "@type": "Person", name: author.firstName },
    publisher: { "@id": organizationId },
  };
}
