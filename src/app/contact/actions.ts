"use server";

import { headers } from "next/headers";
import {
  contactSchema,
  formDataToInput,
  HONEYPOT_FIELD,
  toFieldErrors,
  type ContactFormState,
} from "@/lib/contact-schema";
import { sendContactEmails } from "@/lib/email";
import { contactRateLimiter } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const SUCCESS_MESSAGE = "Merci ! Votre message a bien été envoyé. Nous vous répondons très vite.";

async function clientIp(): Promise<string> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "inconnue";
}

export async function submitContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // 1. Pot de miel : un robot a rempli le champ invisible. On simule un succès sans rien envoyer.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  // 2. Validation (mêmes règles que dans le navigateur).
  const parsed = contactSchema.safeParse(formDataToInput(formData));
  if (!parsed.success) {
    return {
      status: "invalid",
      message: "Certains champs sont à corriger.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const ip = await clientIp();

  // 3. Cloudflare Turnstile (si configuré).
  const token = formData.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof token === "string" ? token : "", ip))) {
    return {
      status: "error",
      message: "La vérification anti-robot a échoué. Rechargez la page et réessayez.",
    };
  }

  // 4. Limitation de débit : 5 envois par heure et par IP.
  const limit = contactRateLimiter.check(ip);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return {
      status: "rate-limited",
      message: `Vous avez envoyé plusieurs messages récemment. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}, ou écrivez-nous directement par e-mail.`,
    };
  }

  // 5. Envoi.
  try {
    const { demo } = await sendContactEmails(parsed.data);
    return { status: "success", message: SUCCESS_MESSAGE, demo };
  } catch (error) {
    console.error("[contact] Échec de l'envoi :", error);
    return {
      status: "error",
      message:
        "Une erreur est survenue pendant l'envoi. Réessayez dans un instant ou écrivez-nous directement par e-mail.",
    };
  }
}
