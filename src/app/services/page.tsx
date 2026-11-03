import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { ServiceLink } from "@/components/services/service-card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CtaBanner } from "@/components/ui/cta-banner";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { getFaq, getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Sites web, applications, analyse de données, plans de maison, modélisation 3D et aménagement : nos offres et notre méthode.",
  alternates: { canonical: "/services" },
};

const steps = [
  {
    title: "Échange",
    text: "Un premier appel ou un message pour comprendre votre besoin, vos contraintes et votre budget.",
  },
  {
    title: "Devis",
    text: "Une proposition claire : périmètre, délai, prix. Un acompte de 30 % lance le projet.",
  },
  {
    title: "Réalisation",
    text: "Nous avançons par étapes et vous montrons le travail en cours pour l'ajuster ensemble.",
  },
  {
    title: "Livraison",
    text: "Vous recevez les fichiers, les accès et les explications pour être autonome.",
  },
];

export default function ServicesPage() {
  const faq = getFaq();
  return (
    <>
      <Section
        headingLevel="h1"
        title="Services"
        intro="Deux domaines, une même exigence. Les tarifs sont indicatifs et non contractuels : chaque projet fait l'objet d'un devis gratuit."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {(["dev", "architecture"] as const).map((domain) => {
            const services = getServices(domain);
            const label = siteConfig.categories[domain].servicesLabel;
            return (
              <section
                key={domain}
                aria-labelledby={`bloc-${domain}`}
                className={`accent-${domain} flex flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8`}
              >
                <h2 id={`bloc-${domain}`} className="text-h2">
                  {label}
                </h2>
                <ul className="mt-4 flex-1">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <ServiceLink service={service} />
                    </li>
                  ))}
                </ul>
                <Button href={`/services/${domain}`} className="mt-8 w-fit">
                  Détail des offres {label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </section>
            );
          })}
        </div>
      </Section>

      <Section id="processus" title="Comment nous travaillons" tone="muted">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="font-display text-4xl text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h3">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="faq" title="Questions fréquentes" containerSize="narrow">
        <Accordion
          name="faq"
          items={faq.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))}
        />
      </Section>

      <CtaBanner />
    </>
  );
}
