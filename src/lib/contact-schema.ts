import "./zod-config";
import { z } from "zod";
import { requestTypeSchema, requestTypes } from "./schemas";

/*
 * Schéma du formulaire de contact, partagé par le navigateur (validation immédiate)
 * et par le serveur (validation de sécurité). Messages d'erreur en français.
 */

export const budgetOptions = [
  { value: "moins-500", label: "Moins de 500 €" },
  { value: "500-1500", label: "500 à 1 500 €" },
  { value: "1500-5000", label: "1 500 à 5 000 €" },
  { value: "plus-5000", label: "Plus de 5 000 €" },
  { value: "inconnu", label: "Je ne sais pas encore" },
] as const;

export const delayOptions = [
  { value: "rapide", label: "Dès que possible" },
  { value: "mois", label: "Dans le mois" },
  { value: "trimestre", label: "Dans 1 à 3 mois" },
  { value: "libre", label: "Pas de date précise" },
] as const;

export { requestTypes };

const optionValues = <T extends ReadonlyArray<{ value: string }>>(options: T) =>
  options.map((option) => option.value) as [T[number]["value"], ...T[number]["value"][]];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Indiquez votre nom (2 caractères minimum).")
    .max(100, "Le nom est trop long (100 caractères maximum)."),
  email: z
    .string()
    .trim()
    .min(1, "Indiquez votre adresse e-mail.")
    .pipe(z.email("Cette adresse e-mail ne semble pas valide.")),
  phone: z
    .string()
    .trim()
    .max(30, "Numéro trop long.")
    .refine(
      (value) => value === "" || /^\+?[0-9 .()-]{6,}$/.test(value),
      "Ce numéro ne semble pas valide.",
    )
    .optional()
    .default(""),
  requestType: requestTypeSchema.or(z.literal("")).refine((value) => value !== "", {
    message: "Choisissez un type de demande.",
  }),
  budget: z.enum(optionValues(budgetOptions), { message: "Choisissez un budget indicatif." }),
  delay: z.enum(optionValues(delayOptions), { message: "Choisissez un délai souhaité." }),
  message: z
    .string()
    .trim()
    .min(20, "Décrivez votre projet en quelques phrases (20 caractères minimum).")
    .max(5000, "Votre message est trop long (5 000 caractères maximum)."),
  consent: z.literal(true, {
    message: "Vous devez accepter le traitement de vos données pour envoyer le formulaire.",
  }),
  /** Offre d'origine (?service=slug), informatif. */
  service: z.string().trim().max(100).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
export type ContactField = keyof ContactInput;

/** Nom du champ piège (invisible pour les humains, rempli par les robots). */
export const HONEYPOT_FIELD = "site_internet";

export type ContactFormState = {
  status: "idle" | "success" | "invalid" | "error" | "rate-limited";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** Vrai si le message a été simulé (aucune clé Resend configurée). */
  demo?: boolean;
};

/** Convertit les erreurs Zod en un message par champ (le premier). */
export function toFieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** Lit un FormData et prépare l'objet à valider. */
export function formDataToInput(formData: FormData): Record<string, unknown> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    requestType: text("requestType"),
    budget: text("budget"),
    delay: text("delay"),
    message: text("message"),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
    service: text("service"),
  };
}

export function labelOf(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
