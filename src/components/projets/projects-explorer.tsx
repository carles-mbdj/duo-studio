"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { siteConfig, type Category } from "@/config/site";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/lib/content-types";
import { ProjectGrid } from "./project-card";

type Filters = { categorie: Category | "tous"; tag: string; q: string };

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function filterProjects(projects: ProjectSummary[], filters: Filters) {
  const query = normalize(filters.q.trim());
  return projects.filter((project) => {
    if (filters.categorie !== "tous" && project.category !== filters.categorie) return false;
    if (filters.tag && !project.tags.includes(filters.tag)) return false;
    if (query) {
      const haystack = normalize(
        [project.title, project.summary, project.role, ...project.tags].join(" "),
      );
      return query.split(/\s+/).every((word) => haystack.includes(word));
    }
    return true;
  });
}

const categoryOptions: Array<{ value: Filters["categorie"]; label: string }> = [
  { value: "tous", label: "Tous" },
  { value: "dev", label: siteConfig.categories.dev.label },
  { value: "architecture", label: siteConfig.categories.architecture.label },
];

/**
 * Liste filtrable des projets. Les filtres sont synchronisés avec l'URL
 * (?categorie=dev&tag=Python&q=tableau) pour pouvoir partager une recherche.
 */
export function ProjectsExplorer({ projects }: { projects: ProjectSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const rawCategory = searchParams.get("categorie");
  const categorie: Filters["categorie"] =
    rawCategory === "dev" || rawCategory === "architecture" ? rawCategory : "tous";
  const tag = searchParams.get("tag") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const update = (next: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { categorie, tag, q, ...next };
    if (merged.categorie === "tous") params.delete("categorie");
    else params.set("categorie", merged.categorie);
    if (merged.tag) params.set("tag", merged.tag);
    else params.delete("tag");
    if (merged.q.trim()) params.set("q", merged.q.trim());
    else params.delete("q");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  // Tags disponibles pour la catégorie sélectionnée.
  const scope = categorie === "tous" ? projects : projects.filter((p) => p.category === categorie);
  const tags = [...new Set(scope.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, "fr"));

  const results = filterProjects(projects, { categorie, tag, q });
  const hasFilters = categorie !== "tous" || tag !== "" || q.trim() !== "";

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <fieldset>
            <legend className="sr-only">Catégorie</legend>
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
              {categoryOptions.map((option) => {
                const active = option.value === categorie;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ categorie: option.value, tag: "" })}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      option.value !== "tous" && `accent-${option.value}`,
                      active ? "bg-accent text-accent-contrast" : "text-muted hover:text-fg",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="relative w-full md:max-w-xs">
            <label htmlFor="recherche-projets" className="sr-only">
              Rechercher un projet
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id="recherche-projets"
              type="search"
              value={q}
              placeholder="Rechercher (titre, outil…)"
              onChange={(event) => {
                setQ(event.target.value);
                update({ q: event.target.value });
              }}
              className="h-11 w-full rounded-full border border-border bg-surface pr-4 pl-10 text-sm outline-none focus:border-fg"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-muted">
            Filtrer par outil ou thème
          </legend>
          <ul className="flex flex-wrap gap-2">
            {tags.map((item) => {
              const active = item === tag;
              return (
                <li key={item}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ tag: active ? "" : item })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-fg bg-fg text-bg"
                        : "border-border text-muted hover:border-fg hover:text-fg",
                    )}
                  >
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {results.length} projet{results.length > 1 ? "s" : ""}
          {hasFilters ? " correspondant à vos critères" : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              update({ categorie: "tous", tag: "", q: "" });
            }}
            className="inline-flex items-center gap-1 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            <X aria-hidden="true" className="size-4" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ProjectGrid projects={results} headingLevel="h2" />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          Aucun projet ne correspond à cette recherche.
        </div>
      )}
    </div>
  );
}
