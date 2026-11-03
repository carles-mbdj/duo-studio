import { expect, test } from "@playwright/test";

test.describe("Parcours principal : accueil → projet → contact", () => {
  test("un visiteur découvre un projet puis envoie une demande (mode démo)", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Deux ingénieurs, deux regards/ }),
    ).toBeVisible();

    // Un projet récent depuis l'accueil
    const recent = page.getByRole("region", { name: "Projets récents" });
    const firstProject = recent
      .getByRole("link")
      .filter({ hasNotText: "Tous les projets" })
      .first();
    const projectTitle = (await firstProject.textContent())?.trim() ?? "";
    await firstProject.click();
    await expect(page).toHaveURL(/\/projets\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(projectTitle);
    await expect(page.getByRole("heading", { name: "Contexte" })).toBeVisible();

    // Appel à l'action du projet
    await page.getByRole("link", { name: "Un projet comme celui-ci ?" }).click();
    await expect(page).toHaveURL(/\/contact$/);

    // Envoi vide : erreurs par champ, focus sur le premier champ en erreur
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByText("Indiquez votre nom (2 caractères minimum).")).toBeVisible();
    await expect(page.getByLabel("Nom")).toBeFocused();
    await expect(page.getByLabel("Nom")).toHaveAttribute("aria-invalid", "true");

    // Formulaire complet
    await page.getByLabel("Nom").fill("Camille Martin");
    await page.getByLabel("E-mail").fill("camille@example.com");
    await page.getByLabel("Type de demande").selectOption("site-web");
    await page.getByLabel("Budget indicatif").selectOption("500-1500");
    await page.getByLabel("Délai souhaité").selectOption("mois");
    await page
      .getByRole("textbox", { name: "Votre projet" })
      .fill("Bonjour, j'aimerais un site vitrine pour mon atelier de céramique.");
    await page.getByRole("checkbox", { name: /J'accepte/ }).check();
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.getByRole("heading", { name: "Message envoyé" })).toBeFocused();
    await expect(page.getByText(/Mode démonstration/)).toBeVisible();
  });

  test("le lien « Demander un devis » pré-sélectionne le type de demande", async ({ page }) => {
    await page.goto("/services/architecture");
    await expect(page.getByText(/ne remplacent pas l'intervention d'un architecte/)).toBeVisible();
    await page.locator("#modelisation-3d").getByRole("link", { name: "Demander un devis" }).click();
    await expect(page).toHaveURL(/\/contact\?service=modelisation-3d$/);
    await expect(page.getByLabel("Type de demande")).toHaveValue("3d");
    await expect(
      page.getByTestId("contact-form").getByText("Modélisation 3D et rendus"),
    ).toBeVisible();
  });

  test("une page inexistante affiche la page 404 personnalisée", async ({ page }) => {
    const response = await page.goto("/cette-page-n-existe-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Cette page n'existe pas/ })).toBeVisible();
    await page.getByRole("link", { name: "Retour à l'accueil", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("un projet inexistant renvoie aussi la page 404", async ({ page }) => {
    const response = await page.goto("/projets/projet-inexistant");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Cette page n'existe pas/ })).toBeVisible();
    // L'en-tête du site reste affiché sur la page 404.
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
