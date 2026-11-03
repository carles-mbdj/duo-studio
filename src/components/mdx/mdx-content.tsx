import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/** Liens internes via next/link, liens externes dans un nouvel onglet. */
function MdxLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

const components = { a: MdxLink };

/**
 * Rend le corps d'un fichier MDX. Le JavaScript embarqué est bloqué : le contenu reste
 * du Markdown enrichi, sans risque d'exécution de code arbitraire.
 */
export function MdxContent({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn("prose-duo", className)}>
      <MDXRemote source={source} components={components} options={{ blockJS: true }} />
    </div>
  );
}
