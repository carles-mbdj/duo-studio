import { z } from "zod";

export const categorySchema = z.enum(["dev", "architecture"]);

const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "doit être en minuscules, chiffres et tirets (ex. mon-projet)",
  );

const publicPathSchema = z.string().startsWith("/", "doit commencer par / (chemin dans public/)");

/** Types de demande proposés dans le formulaire de contact. */
export const requestTypes = [
  { value: "site-web", label: "Site web" },
  { value: "application", label: "Application" },
  { value: "data", label: "Data / Dashboard" },
  { value: "plans", label: "Plans de maison" },
  { value: "3d", label: "Modélisation 3D" },
  { value: "autre", label: "Autre" },
] as const;

export const requestTypeSchema = z.enum(
  requestTypes.map((type) => type.value) as [
    (typeof requestTypes)[number]["value"],
    ...(typeof requestTypes)[number]["value"][],
  ],
);

/* ---------------------------------------------------------------------------
 * Projets — content/projets/*.mdx
 * ------------------------------------------------------------------------- */
export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  category: categorySchema,
  summary: z.string().min(1).max(160, "160 caractères maximum"),
  year: z.number().int().min(2000).max(2100),
  role: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  cover: publicPathSchema,
  gallery: z
    .array(
      z.object({
        src: publicPathSchema,
        alt: z.string().min(1, "texte alternatif obligatoire"),
        caption: z.string().optional(),
      }),
    )
    .default([]),
  link: z.object({ label: z.string().min(1), url: z.url() }).optional(),
  featured: z.boolean().default(false),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

/* ---------------------------------------------------------------------------
 * Services — content/services/*.mdx
 * ------------------------------------------------------------------------- */
export const serviceFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  domain: categorySchema,
  summary: z.string().min(1).max(200, "200 caractères maximum"),
  /** Tarif indicatif en euros. `null` = sur devis. */
  priceFrom: z.number().nonnegative().nullable(),
  /** Précision affichée avec le tarif (ex. « par mois », « par pièce ou façade »). */
  priceNote: z.string().default(""),
  duration: z.string().min(1),
  includes: z.array(z.string().min(1)).min(1),
  forWho: z.array(z.string().min(1)).min(1),
  /** Exemple concret de livrable. */
  deliverable: z.string().min(1),
  /** Type de demande pré-sélectionné dans le formulaire de contact. */
  requestType: requestTypeSchema,
  order: z.number().int(),
});

export type ServiceFrontmatter = z.infer<typeof serviceFrontmatterSchema>;

/* ---------------------------------------------------------------------------
 * Pages éditoriales — content/pages/*.mdx
 * ------------------------------------------------------------------------- */
export const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  updatedAt: z.string().optional(),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/* ---------------------------------------------------------------------------
 * Données structurées — content/donnees/*.json
 * ------------------------------------------------------------------------- */
export const faqSchema = z.array(
  z.object({
    id: slugSchema,
    question: z.string().min(1),
    answer: z.string().min(1),
  }),
);

export const testimonialsSchema = z.array(
  z.object({
    firstName: z.string().min(1),
    role: z.string().min(1),
    quote: z.string().min(1).max(220),
    category: categorySchema,
    /** Toujours true tant que le témoignage est fictif. */
    exemple: z.boolean(),
  }),
);

export const profileSchema = z.object({
  category: categorySchema,
  intro: z.string().min(1),
  skills: z.array(z.object({ group: z.string().min(1), items: z.array(z.string().min(1)).min(1) })),
  timeline: z.array(
    z.object({
      period: z.string().min(1),
      title: z.string().min(1),
      place: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
});

export type Faq = z.infer<typeof faqSchema>;
export type Testimonials = z.infer<typeof testimonialsSchema>;
export type Profile = z.infer<typeof profileSchema>;
