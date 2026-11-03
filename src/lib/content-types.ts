import type { ProjectFrontmatter, ServiceFrontmatter } from "./schemas";

/*
 * Types partagés entre composants serveur et client (sans dépendance à node:fs).
 */

/** Projet sans son corps MDX : ce qui est envoyé aux composants client. */
export type ProjectSummary = ProjectFrontmatter;

export type ServiceSummary = ServiceFrontmatter;

export function toProjectSummary<T extends ProjectFrontmatter & { body?: string }>(
  project: T,
): ProjectSummary {
  const { body: _body, ...summary } = project;
  void _body;
  return summary;
}
