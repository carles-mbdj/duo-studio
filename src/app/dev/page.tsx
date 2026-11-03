import { JsonLd } from "@/components/json-ld";
import { ProfilePage } from "@/components/profile/profile-page";
import { CtaBanner } from "@/components/ui/cta-banner";
import { getProfile } from "@/lib/content";
import { pageMetadata, personJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Dev & Data — Carles",
  description:
    "Carles, étudiant ingénieur en sciences du numérique et futur data scientist : compétences, parcours et projets.",
  path: "/dev",
  type: "profile",
});

export default function DevPage() {
  const skills = getProfile("dev").skills.flatMap((group) => group.items);
  return (
    <>
      <JsonLd data={personJsonLd("dev", skills)} />
      <ProfilePage category="dev" />
      <CtaBanner title="Un projet web ou data ?" />
    </>
  );
}
