import { Clock, Mail, MapPin } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getServices } from "@/lib/content";
import { ContactFormFromUrl } from "./contact-form-from-url";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Parlez-nous de votre projet : site web, application, data, plans de maison ou modélisation 3D. Réponse rapide, devis gratuit.",
  path: "/contact",
});

export default function ContactPage() {
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || undefined;
  // Correspondance offre → type de demande, pour pré-remplir le formulaire via ?service=slug.
  const services = Object.fromEntries(
    getServices().map((service) => [
      service.slug,
      { title: service.title, requestType: service.requestType },
    ]),
  );

  return (
    <section aria-labelledby="contact-titre" className="py-16 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div>
          <h1 id="contact-titre" className="text-h1">
            Parlons de votre projet
          </h1>
          <p className="mt-4 max-w-2xl text-lead text-muted">
            Décrivez-nous votre besoin en quelques lignes. Nous revenons vers vous avec des
            questions ou une première proposition, sans engagement.
          </p>
          <div className="mt-10">
            {/* Le formulaire lit ?service= dans l'URL ; sans paramètre, il s'affiche vide. */}
            <Suspense fallback={<ContactForm turnstileSiteKey={turnstileSiteKey} />}>
              <ContactFormFromUrl services={services} turnstileSiteKey={turnstileSiteKey} />
            </Suspense>
          </div>
        </div>

        <aside aria-label="Coordonnées" className="lg:pt-24">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-h3">Nous joindre</h2>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="break-all text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    {siteConfig.contact.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <div>
                  <p className="font-medium">Ville</p>
                  <p className="text-muted">{siteConfig.contact.city}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <div>
                  <p className="font-medium">Délai de réponse</p>
                  <p className="text-muted">{siteConfig.contact.responseTime}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </Container>
    </section>
  );
}
