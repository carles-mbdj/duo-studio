import { expect, test, type Page } from "@playwright/test";

const projectCards = (page: Page) =>
  page
    .getByRole("main")
    .getByRole("heading", { level: 2 })
    .filter({ has: page.getByRole("link") });

test.describe("Filtres des projets", () => {
  test("filtre par catégorie et par tag, avec URL synchronisée", async ({ page }) => {
    await page.goto("/projets");
    await expect(projectCards(page)).toHaveCount(8);

    await page.getByRole("button", { name: "Architecture", exact: true }).click();
    await expect(page).toHaveURL(/\?categorie=architecture$/);
    await expect(page.getByRole("button", { name: "Architecture", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(projectCards(page)).toHaveCount(4);

    await page.getByRole("button", { name: "Revit", exact: true }).click();
    await expect(page).toHaveURL(/categorie=architecture&tag=Revit/);
    await expect(projectCards(page)).toHaveCount(2);
    await expect(page.getByRole("status")).toHaveText(/2 projets correspondant/);

    await page.getByRole("button", { name: "Réinitialiser les filtres" }).click();
    await expect(page).toHaveURL(/\/projets$/);
    await expect(projectCards(page)).toHaveCount(8);
  });

  test("restaure les filtres depuis l'URL (lien partageable)", async ({ page }) => {
    await page.goto("/projets?categorie=dev&tag=Python");
    await expect(page.getByRole("button", { name: "Python", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(projectCards(page)).toHaveCount(2);
  });

  test("recherche plein texte, insensible aux accents", async ({ page }) => {
    await page.goto("/projets");
    await page.getByRole("searchbox", { name: "Rechercher un projet" }).fill("bibliotheque");
    await expect(page).toHaveURL(/q=bibliotheque/);
    await expect(projectCards(page)).toHaveCount(1);
    await expect(projectCards(page).first()).toHaveText("Bibliothèque de quartier");

    await page.getByRole("searchbox", { name: "Rechercher un projet" }).fill("zzz introuvable");
    await expect(page.getByText("Aucun projet ne correspond à cette recherche.")).toBeVisible();
  });
});
