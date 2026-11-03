"use client";

import { useSearchParams } from "next/navigation";
import { ContactForm } from "@/components/forms/contact-form";

type ServiceMap = Record<string, { title: string; requestType: string }>;

/** Lit ?service=slug pour pré-sélectionner le type de demande. */
export function ContactFormFromUrl({
  services,
  turnstileSiteKey,
}: {
  services: ServiceMap;
  turnstileSiteKey?: string;
}) {
  const slug = useSearchParams().get("service") ?? "";
  const service = Object.hasOwn(services, slug) ? services[slug] : undefined;
  return (
    <ContactForm
      key={slug}
      initialRequestType={service?.requestType}
      serviceTitle={service?.title}
      serviceSlug={service ? slug : ""}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}
