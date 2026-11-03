import { EditorialPage, editorialMetadata } from "@/components/editorial-page";

export const metadata = editorialMetadata("confidentialite");

export default function PrivacyPage() {
  return <EditorialPage slug="confidentialite" />;
}
