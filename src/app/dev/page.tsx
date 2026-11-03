import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/profile-page";
import { CtaBanner } from "@/components/ui/cta-banner";

export const metadata: Metadata = {
  title: "Dev & Data — Carles",
  description:
    "Carles, étudiant ingénieur en sciences du numérique et futur data scientist : compétences, parcours et projets.",
  alternates: { canonical: "/dev" },
};

export default function DevPage() {
  return (
    <>
      <ProfilePage category="dev" />
      <CtaBanner title="Un projet web ou data ?" />
    </>
  );
}
