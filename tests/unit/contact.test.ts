import { describe, expect, it } from "vitest";
import {
  contactSchema,
  formDataToInput,
  toFieldErrors,
  type ContactInput,
} from "@/lib/contact-schema";
import { createRateLimiter } from "@/lib/rate-limit";

const valid: ContactInput = {
  name: "Camille Martin",
  email: "camille@example.com",
  phone: "",
  requestType: "plans",
  budget: "500-1500",
  delay: "mois",
  message: "Bonjour, je souhaite des plans pour une extension de 25 m².",
  consent: true,
  service: "",
};

describe("schéma de contact", () => {
  it("accepte une demande complète", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("renvoie un message en français par champ invalide", () => {
    const result = contactSchema.safeParse({
      ...valid,
      name: "C",
      email: "pas-un-email",
      requestType: "",
      message: "Trop court",
      consent: false,
    });
    expect(result.success).toBe(false);
    const errors = toFieldErrors(result.error!);
    expect(errors.name).toMatch(/nom/);
    expect(errors.email).toBe("Cette adresse e-mail ne semble pas valide.");
    expect(errors.requestType).toBe("Choisissez un type de demande.");
    expect(errors.message).toMatch(/20 caractères/);
    expect(errors.consent).toMatch(/accepter/);
  });

  it("signale l'e-mail manquant avec un message dédié", () => {
    const errors = toFieldErrors(contactSchema.safeParse({ ...valid, email: "" }).error!);
    expect(errors.email).toBe("Indiquez votre adresse e-mail.");
  });

  it("valide le téléphone seulement s'il est renseigné", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "06 12 34 56 78" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, phone: "abc" }).success).toBe(false);
  });

  it("rejette les valeurs hors liste (budget, délai, type)", () => {
    const result = contactSchema.safeParse({
      ...valid,
      budget: "1-million",
      delay: "hier",
      requestType: "pirate",
    });
    const errors = toFieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(["budget", "delay", "requestType"]);
  });

  it("lit correctement un FormData (case cochée = « on »)", () => {
    const data = new FormData();
    for (const [key, value] of Object.entries(valid)) {
      if (key !== "consent") data.set(key, String(value));
    }
    data.set("consent", "on");
    expect(contactSchema.safeParse(formDataToInput(data)).success).toBe(true);
    data.delete("consent");
    expect(contactSchema.safeParse(formDataToInput(data)).success).toBe(false);
  });
});

describe("limitation de débit", () => {
  it("autorise 5 envois par heure puis bloque", () => {
    const now = 0;
    const limiter = createRateLimiter({ limit: 5, windowMs: 3_600_000, now: () => now });
    for (let i = 0; i < 5; i++) expect(limiter.check("1.2.3.4").allowed).toBe(true);
    const blocked = limiter.check("1.2.3.4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(3_600_000);
  });

  it("compte séparément chaque adresse IP", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("libère de nouveau des envois quand la fenêtre glisse", () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
    limiter.check("ip");
    now = 500;
    limiter.check("ip");
    expect(limiter.check("ip").allowed).toBe(false);
    now = 1001; // le premier envoi est sorti de la fenêtre
    expect(limiter.check("ip").allowed).toBe(true);
    expect(limiter.check("ip").allowed).toBe(false);
  });

  it("borne la mémoire utilisée", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0, maxKeys: 2 });
    limiter.check("a");
    limiter.check("b");
    limiter.check("c"); // « a » est évincé
    expect(limiter.check("a").allowed).toBe(true);
  });
});
