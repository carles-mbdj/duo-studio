/**
 * Insère des données structurées JSON-LD.
 * Les caractères « < » sont échappés pour empêcher toute fermeture prématurée de la balise.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
