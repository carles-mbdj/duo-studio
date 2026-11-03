import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container size="wide" className="grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{siteConfig.baseline}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Mail aria-hidden="true" className="size-4" />
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="underline-offset-4 hover:text-fg hover:underline"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              {siteConfig.contact.city}
            </li>
          </ul>
        </div>

        <nav aria-label="Plan du site">
          <h2 className="font-sans text-sm font-semibold">Explorer</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {siteConfig.nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations">
          <h2 className="font-sans text-sm font-semibold">Informations</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {siteConfig.legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Réseaux sociaux">
          <h2 className="font-sans text-sm font-semibold">Réseaux</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {siteConfig.social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-fg"
                >
                  {item.label}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container
        size="wide"
        className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted sm:flex-row sm:justify-between"
      >
        <p>© {siteConfig.name} — site de démonstration, contenus d&apos;exemple.</p>
        <p>Tarifs indicatifs, non contractuels.</p>
      </Container>
    </footer>
  );
}
