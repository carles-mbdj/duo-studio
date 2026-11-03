import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Logo texte : les deux points reprennent les accents des deux univers. */
export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-2 font-display text-xl font-medium tracking-tight whitespace-nowrap"
      aria-label={`${siteConfig.name}, retour à l'accueil`}
    >
      <span aria-hidden="true" className="flex gap-1">
        <span className="size-2.5 rounded-full bg-dev" />
        <span className="size-2.5 rounded-full bg-architecture" />
      </span>
      {siteConfig.name}
    </Link>
  );
}
