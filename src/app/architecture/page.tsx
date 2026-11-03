import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/profile-page";
import { CtaBanner } from "@/components/ui/cta-banner";

export const metadata: Metadata = {
  title: "Architecture — Gédéon",
  description:
    "Gédéon, étudiant ingénieur en génie civil : plans, modélisation 3D, rendus et projets de conception.",
  alternates: { canonical: "/architecture" },
};

export default function ArchitecturePage() {
  return (
    <>
      <ProfilePage category="architecture" />
      <CtaBanner title="Des plans ou des rendus 3D ?" />
    </>
  );
}
