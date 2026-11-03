import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ServiceCard } from "@/components/services/service-card";
import { TransparencyNotice } from "@/components/services/transparency-notice";
import { CtaBanner } from "@/components/ui/cta-banner";
import { Section } from "@/components/ui/section";
import { siteConfig, type Category } from "@/config/site";
import { getServices } from "@/lib/content";

const intros: Record<Category, string> = {
  dev: "Sites, applications et données : des outils sur mesure, pensés pour être simples à utiliser et à faire évoluer.",
  architecture:
    "Dessin de plans, modélisation 3D et aménagement : visualiser et préciser votre projet avant de lancer les travaux.",
};

export function ServicesDomainPage({ domain }: { domain: Category }) {
  const services = getServices(domain);
  return (
    <div className={`accent-${domain}`}>
      <Section
        headingLevel="h1"
        eyebrow="Services"
        title={siteConfig.categories[domain].servicesLabel}
        intro={intros[domain]}
        action={
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Tous les services
          </Link>
        }
      >
        {domain === "architecture" && (
          <div className="mb-10">
            <TransparencyNotice />
          </div>
        )}
        <ul className="grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug} className="flex">
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          Tarifs indicatifs, non contractuels. Le prix définitif est fixé dans le devis.
        </p>
      </Section>
      <CtaBanner />
    </div>
  );
}
