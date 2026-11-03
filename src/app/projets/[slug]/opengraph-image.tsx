import { siteConfig } from "@/config/site";
import { getProject, getProjects } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Aperçu du projet";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) {
    return renderOgImage({ title: siteConfig.name, subtitle: siteConfig.baseline });
  }
  return renderOgImage({
    eyebrow: `${siteConfig.categories[project.category].label} · ${project.year}`,
    title: project.title,
    subtitle: project.summary,
    category: project.category,
  });
}
