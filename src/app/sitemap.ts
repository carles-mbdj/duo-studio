import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/dev", priority: 0.9 },
  { path: "/architecture", priority: 0.9 },
  { path: "/projets", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  { path: "/services/dev", priority: 0.8 },
  { path: "/services/architecture", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
  { path: "/a-propos", priority: 0.6 },
  { path: "/mentions-legales", priority: 0.2 },
  { path: "/confidentialite", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...getProjects().map((project) => ({
      url: absoluteUrl(`/projets/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: project.featured ? 0.7 : 0.6,
    })),
  ];
}
