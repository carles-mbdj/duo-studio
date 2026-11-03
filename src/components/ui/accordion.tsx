import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

/**
 * Accordéon basé sur <details>/<summary> : accessible au clavier et aux lecteurs d'écran
 * sans JavaScript. L'attribut `name` garantit qu'un seul panneau est ouvert à la fois.
 */
export function Accordion({
  items,
  name = "accordeon",
  className,
}: {
  items: AccordionItem[];
  name?: string;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <details key={item.id} name={name} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="max-w-3xl pb-6 leading-relaxed text-muted">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
