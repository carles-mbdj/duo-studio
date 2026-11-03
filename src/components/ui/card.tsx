import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  /** Ajoute l'effet de survol (élévation). */
  interactive?: boolean;
};

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
        interactive &&
          "transition-[box-shadow,translate,border-color] duration-300 focus-within:shadow-lift hover:border-accent hover:shadow-lift motion-safe:hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
}
