import { EditorialPage, editorialMetadata } from "@/components/editorial-page";

export const metadata = editorialMetadata("mentions-legales");

export default function LegalNoticePage() {
  return <EditorialPage slug="mentions-legales" />;
}
