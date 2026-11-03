import { ArrowRight, Check, Clock, Package, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice, type Service } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Carte détaillée d'une offre (pages /services/dev et /services/architecture). */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card
      id={service.slug}
      className={cn(`accent-${service.domain} flex scroll-mt-24 flex-col p-6 sm:p-8`)}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-h3">{service.title}</h2>
        <p className="shrink-0 font-semibold text-accent-text">
          {formatPrice(service)}
          <span className="sr-only text-muted"> (tarif indicatif)</span>
        </p>
      </div>
      <p className="mt-3 leading-relaxed text-muted">{service.summary}</p>

      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold">
            <Users aria-hidden="true" className="size-4 text-accent-text" />
            Pour qui
          </dt>
          <dd className="mt-2">
            <ul className="space-y-1.5 text-sm text-muted">
              {service.forWho.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold">
            <Check aria-hidden="true" className="size-4 text-accent-text" />
            Ce qui est inclus
          </dt>
          <dd className="mt-2">
            <ul className="space-y-1.5 text-sm text-muted">
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold">
            <Clock aria-hidden="true" className="size-4 text-accent-text" />
            Délai
          </dt>
          <dd className="mt-2 text-sm text-muted">{service.duration}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold">
            <Package aria-hidden="true" className="size-4 text-accent-text" />
            Exemple de livrable
          </dt>
          <dd className="mt-2 text-sm text-muted">{service.deliverable}</dd>
        </div>
      </dl>

      {service.body.trim() && (
        <p className="mt-6 border-t border-border pt-6 text-sm leading-relaxed text-muted">
          {service.body.trim()}
        </p>
      )}

      <div className="mt-8">
        <Button href={`/contact?service=${service.slug}`}>
          Demander un devis
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

/** Ligne compacte d'une offre (accueil, vue d'ensemble des services). */
export function ServiceLink({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.domain}#${service.slug}`}
      className="group flex items-start justify-between gap-4 rounded-xl border-b border-border py-4 transition-colors hover:border-accent"
    >
      <span>
        <span className="block font-medium transition-colors group-hover:text-accent-text">
          {service.title}
        </span>
        <span className="mt-1 block text-sm text-muted">{formatPrice(service)}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:text-accent-text motion-safe:group-hover:translate-x-1"
      />
    </Link>
  );
}
