import { JsonLd } from "@/components/json-ld";
import { ProfilePage } from "@/components/profile/profile-page";
import { CtaBanner } from "@/components/ui/cta-banner";
import { getProfile } from "@/lib/content";
import { pageMetadata, personJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Architecture — Gédéon",
  description:
    "Gédéon, étudiant ingénieur en génie civil : plans, modélisation 3D, rendus et projets de conception.",
  path: "/architecture",
  type: "profile",
});

export default function ArchitecturePage() {
  const skills = getProfile("architecture").skills.flatMap((group) => group.items);
  return (
    <>
      <JsonLd data={personJsonLd("architecture", skills)} />
      <ProfilePage category="architecture" />
      <CtaBanner title="Des plans ou des rendus 3D ?" />
    </>
  );
}
