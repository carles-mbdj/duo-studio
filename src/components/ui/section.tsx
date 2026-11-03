import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  /** Élément d'action affiché à droite du titre (lien « Tout voir », etc.). */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
  tone?: "default" | "muted";
  headingLevel?: "h1" | "h2";
};

export function Section({
  id,
  eyebrow,
  title,
  intro,
  action,
  children,
  className,
  containerSize,
  tone = "default",
  headingLevel = "h2",
}: SectionProps) {
  const Heading = headingLevel;
  const headingId = id ? `${id}-titre` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title && headingId ? headingId : undefined}
      className={cn("py-16 sm:py-24", tone === "muted" && "bg-surface-muted", className)}
    >
      <Container size={containerSize}>
        {(title || eyebrow || intro) && (
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {eyebrow && (
                <p className="mb-3 text-sm font-semibold tracking-wider text-accent-text uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <Heading id={headingId} className={headingLevel === "h1" ? "text-h1" : "text-h2"}>
                  {title}
                </Heading>
              )}
              {intro && <div className="mt-4 text-lead text-muted">{intro}</div>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
