import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Testimonials as TestimonialsData } from "@/lib/schemas";

/** Témoignages — tous fictifs (champ `exemple: true` dans content/donnees/temoignages.json). */
export function Testimonials({ items }: { items: TestimonialsData }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <li key={item.firstName} className="flex">
          <Card className={`accent-${item.category} flex w-full flex-col p-6`}>
            <figure className="flex h-full flex-col">
              <Quote aria-hidden="true" className="size-6 text-accent-text" />
              <blockquote className="mt-4 flex-1 leading-relaxed">« {item.quote} »</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold">{item.firstName}</span>
                <span className="text-muted"> — {item.role}</span>
              </figcaption>
            </figure>
          </Card>
        </li>
      ))}
    </ul>
  );
}
