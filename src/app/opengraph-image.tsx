import { siteConfig } from "@/config/site";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = `${siteConfig.name} — ${siteConfig.baseline}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    eyebrow: siteConfig.baseline,
    title: "Deux ingénieurs, deux regards, un studio.",
    subtitle: "Du code et des données d'un côté, des plans et des volumes de l'autre.",
  });
}
