import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";

describe("siteConfig", () => {
  it("expose les deux catégories avec leur accent", () => {
    expect(siteConfig.categories.dev.accent).toBe("#4F46E5");
    expect(siteConfig.categories.architecture.accent).toBe("#C2410C");
  });

  it("contient la navigation principale attendue", () => {
    expect(siteConfig.nav.map((item) => item.href)).toEqual([
      "/",
      "/dev",
      "/architecture",
      "/projets",
      "/services",
      "/contact",
    ]);
  });
});
