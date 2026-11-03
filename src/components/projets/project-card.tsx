import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content-types";

type ProjectCardProps = {
  project: ProjectSummary;
  headingLevel?: "h2" | "h3";
  /** Précharge l'image (à réserver aux cartes visibles au premier écran). */
  priority?: boolean;
  className?: string;
};

export function ProjectCard({
  project,
  headingLevel = "h3",
  priority,
  className,
}: ProjectCardProps) {
  const Heading = headingLevel;
  return (
    <Card interactive className={cn(`accent-${project.category} group flex flex-col`, className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <Image
          src={project.cover}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <Badge tone="accent">{siteConfig.categories[project.category].label}</Badge>
          <span>{project.year}</span>
        </div>
        <Heading className="text-h3">
          <Link
            href={`/projets/${project.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Outils et thèmes">
          {project.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        className="absolute top-4 right-4 size-9 rounded-full bg-surface p-2 text-accent-text opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      />
    </Card>
  );
}

export function ProjectGrid({
  projects,
  headingLevel,
  priorityCount = 0,
}: {
  projects: ProjectSummary[];
  headingLevel?: "h2" | "h3";
  priorityCount?: number;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <li key={project.slug} className="flex">
          <ProjectCard
            project={project}
            headingLevel={headingLevel}
            priority={index < priorityCount}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
