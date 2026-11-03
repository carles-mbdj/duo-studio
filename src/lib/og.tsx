import { ImageResponse } from "next/og";
import { siteConfig, type Category } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const backgrounds: Record<Category | "neutre", string> = {
  dev: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #4f46e5 100%)",
  architecture: "linear-gradient(135deg, #431407 0%, #7c2d12 55%, #c2410c 100%)",
  neutre: "linear-gradient(135deg, #0f1115 0%, #1e1b4b 50%, #7c2d12 100%)",
};

/** Image Open Graph générée à la volée (1200 × 630). */
export function renderOgImage({
  title,
  subtitle,
  eyebrow,
  category,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  category?: Category;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: backgrounds[category ?? "neutre"],
        color: "#ffffff",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#818cf8" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fb923c" }} />
        </div>
        {siteConfig.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.8,
              fontFamily: "sans-serif",
            }}
          >
            {eyebrow}
          </div>
        )}
        <div style={{ fontSize: title.length > 40 ? 64 : 76, lineHeight: 1.08, maxWidth: 1000 }}>
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              opacity: 0.85,
              maxWidth: 960,
              fontFamily: "sans-serif",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>,
    ogSize,
  );
}
