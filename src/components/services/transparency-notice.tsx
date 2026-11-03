import { Info } from "lucide-react";

/** Encadré de transparence obligatoire sur /services/architecture (titre d'architecte protégé). */
export function TransparencyNotice() {
  return (
    <aside
      aria-label="Information importante"
      className="flex gap-4 rounded-2xl border-l-4 border-architecture bg-architecture-soft p-6"
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-architecture-text" />
      <div className="space-y-2 text-sm leading-relaxed">
        <p className="font-semibold">Transparence</p>
        <p>
          Nos prestations ne remplacent pas l&apos;intervention d&apos;un architecte
          lorsqu&apos;elle est obligatoire (par exemple pour un permis de construire au-delà de 150
          m² de surface de plancher).
        </p>
        <p className="text-muted">
          Nous proposons du dessin de plans, de la modélisation 3D et de l&apos;aménagement. Les
          études de structure réglementaires restent du ressort de professionnels qualifiés.
        </p>
      </div>
    </aside>
  );
}
