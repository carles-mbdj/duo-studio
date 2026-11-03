import { expect, test } from "@playwright/test";

test.describe("Navigation mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Concerne uniquement les petits écrans");

  test("le menu burger s'ouvre, navigue et se referme", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeHidden();

    const burger = page.getByRole("button", { name: "Ouvrir le menu" });
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();

    const mobileNav = page.getByRole("navigation", { name: "Navigation mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(page.getByRole("button", { name: "Fermer le menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await mobileNav.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(mobileNav).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: "Services" })).toBeVisible();
  });

  test("la touche Échap referme le menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Navigation mobile" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Navigation mobile" })).toBeHidden();
  });

  test("aucun défilement horizontal sur les pages principales", async ({ page }) => {
    for (const path of ["/", "/dev", "/architecture", "/projets", "/services", "/contact"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `débordement horizontal sur ${path}`).toBeLessThanOrEqual(0);
    }
  });
});
