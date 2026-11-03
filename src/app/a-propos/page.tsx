import { EditorialPage, editorialMetadata } from "@/components/editorial-page";
import { CtaBanner } from "@/components/ui/cta-banner";

export const metadata = editorialMetadata("a-propos");

export default function AboutPage() {
  return (
    <>
      <EditorialPage slug="a-propos" />
      <CtaBanner />
    </>
  );
}
