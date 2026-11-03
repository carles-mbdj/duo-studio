import { expect, test } from "@playwright/test";

const theme = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));

test.describe("Thème clair / sombre", () => {
  test("suit la préférence système par défaut", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await theme(page)).toBe("dark");
    await context.close();
  });

  test("bascule, mémorise le choix et l'applique avant le premier rendu", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "light" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await theme(page)).toBe("light");

    await page.getByRole("button", { name: "Basculer entre thème clair et sombre" }).click();
    expect(await theme(page)).toBe("dark");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(15, 17, 21)");

    // Au rechargement, le thème est appliqué par le script inline dès le HTML (pas de flash).
    let themeAtFirstParse: string | null = null;
    page.once("domcontentloaded", async () => {
      themeAtFirstParse = await theme(page);
    });
    await page.reload();
    await expect.poll(() => themeAtFirstParse).toBe("dark");

    // Le choix reste mémorisé sur une autre page.
    await page.goto("/projets");
    expect(await theme(page)).toBe("dark");
    await context.close();
  });
});
