import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectGrid } from "@/components/projets/project-card";
import { ProjectsExplorer } from "@/components/projets/projects-explorer";
import { Section } from "@/components/ui/section";
import { getProjects } from "@/lib/content";
import { toProjectSummary } from "@/lib/content-types";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "Tous les projets de Duo Studio : développement, data, plans de maison, rénovation et modélisation 3D.",
  alternates: { canonical: "/projets" },
};

export default function ProjectsPage() {
  const projects = getProjects().map(toProjectSummary);
  return (
    <Section
      headingLevel="h1"
      title="Projets"
      intro="Projets d'école, stages et premières réalisations. Filtrez par univers, par outil ou recherchez un mot-clé."
    >
      {/* Les filtres lisent l'URL : la liste complète sert de rendu statique en attendant. */}
      <Suspense fallback={<ProjectGrid projects={projects} headingLevel="h2" />}>
        <ProjectsExplorer projects={projects} />
      </Suspense>
    </Section>
  );
}
