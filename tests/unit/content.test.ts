import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatPrice,
  getAllTags,
  getFaq,
  getPage,
  getProfile,
  getProject,
  getProjects,
  getRecentProjects,
  getRelatedProjects,
  getServices,
  getTestimonials,
  sortProjects,
  type Project,
} from "@/lib/content";
import { projectFrontmatterSchema } from "@/lib/schemas";

describe("projets", () => {
  it("charge les 8 projets de démonstration, 4 par catégorie", () => {
    expect(getProjects()).toHaveLength(8);
    expect(getProjects("dev")).toHaveLength(4);
    expect(getProjects("architecture")).toHaveLength(4);
  });

  it("ignore les fichiers modèles préfixés par « _ »", () => {
    expect(getProject("mon-projet")).toBeUndefined();
  });

  it("trie par mise en avant puis par année décroissante", () => {
    const base = getProjects()[0]!;
    const sorted = sortProjects([
      { ...base, slug: "a", title: "A", featured: false, year: 2026 },
      { ...base, slug: "b", title: "B", featured: true, year: 2024 },
      { ...base, slug: "c", title: "C", featured: false, year: 2025 },
    ] satisfies Project[]);
    expect(sorted.map((p) => p.slug)).toEqual(["b", "a", "c"]);
  });

  it("retrouve un projet par son slug avec son corps MDX", () => {
    const project = getProject("maison-individuelle-r1");
    expect(project?.category).toBe("architecture");
    expect(project?.body).toContain("## Contexte");
  });

  it("propose des projets similaires de la même catégorie", () => {
    const project = getProject("tableau-de-bord-ventes")!;
    const related = getRelatedProjects(project);
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.category === "dev" && p.slug !== project.slug)).toBe(true);
  });

  it("mélange les deux univers dans les projets récents", () => {
    const recent = getRecentProjects(3);
    expect(recent).toHaveLength(3);
    expect(new Set(recent.map((p) => p.category)).size).toBe(2);
  });

  it("référence uniquement des images présentes dans public/", () => {
    for (const project of getProjects()) {
      for (const src of [project.cover, ...project.gallery.map((g) => g.src)]) {
        expect(fs.existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
      }
    }
  });

  it("liste les tags sans doublon", () => {
    const tags = getAllTags();
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toContain("Python");
  });
});

describe("validation du frontmatter", () => {
  it("rejette un résumé trop long et une catégorie inconnue", () => {
    const result = projectFrontmatterSchema.safeParse({
      title: "Test",
      slug: "test",
      category: "cuisine",
      summary: "x".repeat(161),
      year: 2026,
      role: "Rôle",
      tags: ["Tag"],
      cover: "/demo/x.svg",
    });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["category", "summary"]));
  });

  it("fait échouer le chargement avec un message indiquant le fichier fautif", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "duo-content-"));
    fs.mkdirSync(path.join(tmp, "content", "projets"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, "content", "projets", "casse.mdx"),
      "---\ntitle: Casse\nslug: casse\ncategory: dev\n---\nCorps",
    );
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(tmp);
    vi.resetModules();
    try {
      const fresh = await import("@/lib/content");
      expect(() => fresh.getProjects()).toThrowError(/content\/projets\/casse\.mdx[\s\S]*summary/);
    } finally {
      cwd.mockRestore();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    vi.resetModules();
  });
});

describe("services", () => {
  it("charge 4 offres par domaine, triées par ordre", () => {
    const dev = getServices("dev");
    expect(dev).toHaveLength(4);
    expect(getServices("architecture")).toHaveLength(4);
    expect(dev.map((s) => s.order)).toEqual([...dev.map((s) => s.order)].sort((a, b) => a - b));
  });

  it("formate les tarifs indicatifs", () => {
    expect(formatPrice({ priceFrom: null, priceNote: "" })).toBe("Sur devis");
    expect(formatPrice({ priceFrom: 49, priceNote: "par mois" }).replace(/\s/g, " ")).toBe(
      "À partir de 49 € par mois",
    );
  });

  it("n'utilise jamais « architecte » comme titre professionnel dans les offres", () => {
    for (const service of getServices("architecture")) {
      expect(service.title.toLowerCase()).not.toContain("architecte");
    }
  });
});

describe("pages et données", () => {
  it("charge les pages éditoriales", () => {
    expect(getPage("a-propos")?.title).toBe("À propos");
    expect(getPage("mentions-legales")?.body).toContain("[À COMPLÉTER]");
    expect(getPage("inexistante")).toBeUndefined();
  });

  it("charge la FAQ (6 questions) et les témoignages marqués comme exemples", () => {
    expect(getFaq()).toHaveLength(6);
    const testimonials = getTestimonials();
    expect(testimonials).toHaveLength(3);
    expect(testimonials.every((t) => t.exemple)).toBe(true);
  });

  it("charge les deux profils", () => {
    expect(getProfile("dev").skills.map((s) => s.group)).toContain("Data");
    expect(getProfile("architecture").timeline.length).toBeGreaterThan(0);
  });
});
