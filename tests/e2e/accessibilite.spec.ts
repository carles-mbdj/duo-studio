import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/dev",
  "/architecture",
  "/projets",
  "/projets/maison-individuelle-r1",
  "/services",
  "/services/architecture",
  "/contact",
  "/a-propos",
  "/mentions-legales",
];

test.describe("Accessibilité (axe-core, WCAG 2.2 AA)", () => {
  test.skip(({ isMobile }) => isMobile, "Audit effectué une fois, sur bureau");

  for (const colorScheme of ["light", "dark"] as const) {
    for (const path of pages) {
      test(`${path} — thème ${colorScheme === "light" ? "clair" : "sombre"}`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ colorScheme, reducedMotion: "reduce" });
        const page = await context.newPage();
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        );
        expect(summary).toEqual([]);
        await context.close();
      });
    }
  }

  test("le lien d'évitement mène au contenu principal", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu principal" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#contenu")).toBeFocused();
  });

  test("la visionneuse d'images fonctionne au clavier", async ({ page }) => {
    await page.goto("/projets/pavillon-de-jardin");
    const first = page.getByRole("button", { name: /Agrandir l'image 1 sur 3/ });
    await first.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Image 1 sur 3")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText("Image 2 sur 3")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("Image 3 sur 3")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });
});
