import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import type { Category } from "@/config/site";
import {
  faqSchema,
  pageFrontmatterSchema,
  profileSchema,
  projectFrontmatterSchema,
  serviceFrontmatterSchema,
  testimonialsSchema,
  type PageFrontmatter,
  type ProjectFrontmatter,
  type ServiceFrontmatter,
} from "./schemas";

/*
 * Lecture du contenu (fichiers MDX et JSON du dossier content/).
 * Les lectures sont synchrones : Next.js les exécute pendant le prérendu et les pages
 * restent entièrement statiques. Toute donnée invalide fait échouer le build avec un
 * message indiquant le fichier et le champ fautifs.
 */

export const CONTENT_DIR = path.join(process.cwd(), "content");

export class ContentValidationError extends Error {
  constructor(file: string, details: string) {
    super(`Contenu invalide dans ${file} :\n${details}`);
    this.name = "ContentValidationError";
  }
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map(
      (issue) => `  • ${issue.path.length ? issue.path.join(".") : "(racine)"} : ${issue.message}`,
    )
    .join("\n");
}

function parseOrThrow<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ContentValidationError(file, formatIssues(result.error));
  return result.data;
}

function relative(file: string) {
  return path.relative(process.cwd(), file).replaceAll("\\", "/");
}

type MdxEntry<T> = T & { body: string };

function readMdxCollection<S extends z.ZodType<{ slug: string }>>(
  dir: string,
  schema: S,
): Array<MdxEntry<z.output<S>>> {
  const absoluteDir = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs
    .readdirSync(absoluteDir)
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => {
      const fullPath = path.join(absoluteDir, file);
      const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
      const parsed: z.output<S> = parseOrThrow(schema, data, relative(fullPath));
      const expectedSlug = file.replace(/\.mdx$/, "");
      if (parsed.slug !== expectedSlug) {
        throw new ContentValidationError(
          relative(fullPath),
          `  • slug : « ${parsed.slug} » doit être identique au nom du fichier (« ${expectedSlug} »)`,
        );
      }
      return Object.assign({}, parsed, { body: content });
    });
}

function readJson<S extends z.ZodType>(file: string, schema: S): z.output<S> {
  const fullPath = path.join(CONTENT_DIR, file);
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    throw new ContentValidationError(relative(fullPath), `  • JSON illisible : ${String(error)}`);
  }
  return parseOrThrow(schema, raw, relative(fullPath));
}

/* ---------------------------------------------------------------------------
 * Projets
 * ------------------------------------------------------------------------- */
export type Project = MdxEntry<ProjectFrontmatter>;

/** Tri : projets mis en avant d'abord, puis année décroissante, puis titre. */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.year - a.year ||
      a.title.localeCompare(b.title, "fr"),
  );
}

export function getProjects(category?: Category): Project[] {
  const all = readMdxCollection("projets", projectFrontmatterSchema);
  return sortProjects(category ? all.filter((p) => p.category === category) : all);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

/** Projets proches : même catégorie, classés par nombre de tags communs. */
export function getRelatedProjects(project: Project, limit = 3): Project[] {
  return getProjects(project.category)
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, score: p.tags.filter((tag) => project.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

export function getAllTags(category?: Category): string[] {
  const tags = new Set(getProjects(category).flatMap((project) => project.tags));
  return [...tags].sort((a, b) => a.localeCompare(b, "fr"));
}

/** Sélection pour l'accueil : alterne les deux univers. */
export function getRecentProjects(limit = 3): Project[] {
  const dev = getProjects("dev");
  const archi = getProjects("architecture");
  const mixed: Project[] = [];
  for (let i = 0; mixed.length < limit && (i < dev.length || i < archi.length); i++) {
    const [first, second] = i % 2 === 0 ? [dev[i], archi[i]] : [archi[i], dev[i]];
    if (first) mixed.push(first);
    if (second && mixed.length < limit) mixed.push(second);
  }
  return mixed;
}

/* ---------------------------------------------------------------------------
 * Services
 * ------------------------------------------------------------------------- */
export type Service = MdxEntry<ServiceFrontmatter>;

export function getServices(domain?: Category): Service[] {
  const all = readMdxCollection("services", serviceFrontmatterSchema);
  return all
    .filter((service) => !domain || service.domain === domain)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fr"));
}

export function getService(slug: string): Service | undefined {
  return getServices().find((service) => service.slug === slug);
}

/* ---------------------------------------------------------------------------
 * Pages éditoriales
 * ------------------------------------------------------------------------- */
export type Page = PageFrontmatter & { slug: string; body: string };

export function getPage(slug: string): Page | undefined {
  const fullPath = path.join(CONTENT_DIR, "pages", `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return undefined;
  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
  return { ...parseOrThrow(pageFrontmatterSchema, data, relative(fullPath)), slug, body: content };
}

/* ---------------------------------------------------------------------------
 * Données (FAQ, témoignages, profils)
 * ------------------------------------------------------------------------- */
export function getFaq() {
  return readJson("donnees/faq.json", faqSchema);
}

export function getTestimonials() {
  return readJson("donnees/temoignages.json", testimonialsSchema);
}

export function getProfile(category: Category) {
  const profile = readJson(`donnees/profil-${category}.json`, profileSchema);
  if (profile.category !== category) {
    throw new ContentValidationError(
      `content/donnees/profil-${category}.json`,
      `  • category : doit valoir « ${category} »`,
    );
  }
  return profile;
}

/* ---------------------------------------------------------------------------
 * Formatage
 * ------------------------------------------------------------------------- */
export function formatPrice(service: Pick<Service, "priceFrom" | "priceNote">): string {
  if (service.priceFrom === null) return "Sur devis";
  const amount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(service.priceFrom);
  return `À partir de ${amount}${service.priceNote ? ` ${service.priceNote}` : ""}`;
}
