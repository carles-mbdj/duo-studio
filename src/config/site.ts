/**
 * Configuration centrale du site.
 *
 * ⚠️ Toutes les valeurs ci-dessous sont des EXEMPLES de démonstration
 * (nom, domaine, e-mail, liens, coordonnées). Remplacez-les avant la mise en ligne.
 */

export type Category = "dev" | "architecture";

export const siteConfig = {
  /** (exemple) */
  name: "Duo Studio",
  /** (exemple) */
  baseline: "Code, données et architecture",
  description:
    "Deux frères étudiants ingénieurs : développement web et data d'un côté, plans et modélisation 3D de l'autre.",
  /** Utilisé pour les URL canoniques, le sitemap et les images Open Graph. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** (exemple) */
  domain: "duostudio.example",
  locale: "fr_FR",
  contact: {
    /** (exemple) */
    email: "contact@duostudio.example",
    /** (exemple) */
    city: "Orléans",
    /** (exemple) */
    responseTime: "sous 48 h",
  },
  /** (exemples) */
  social: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
  ],
  people: {
    dev: {
      firstName: "Carles",
      title: "Étudiant ingénieur en sciences du numérique",
      goal: "Futur data scientist",
      cv: "/demo/cv-exemple.pdf",
    },
    architecture: {
      firstName: "Gédéon",
      title: "Étudiant ingénieur en génie civil",
      goal: "Se destine à l'architecture",
      cv: "/demo/cv-exemple.pdf",
    },
  },
  categories: {
    dev: { label: "Dev & Data", servicesLabel: "Informatique & Data", accent: "#4F46E5" },
    architecture: {
      label: "Architecture",
      servicesLabel: "Architecture & Design",
      accent: "#C2410C",
    },
  },
  nav: [
    { label: "Accueil", href: "/" },
    { label: "Dev & Data", href: "/dev" },
    { label: "Architecture", href: "/architecture" },
    { label: "Projets", href: "/projets" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
  legalNav: [
    { label: "À propos", href: "/a-propos" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/confidentialite" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
