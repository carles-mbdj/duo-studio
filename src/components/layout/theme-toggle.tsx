"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Bascule clair/sombre. Les deux icônes sont rendues côté serveur et l'une est masquée en CSS
 * selon data-theme : aucun écart d'hydratation, aucun flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le thème reste appliqué pour la session.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        "inline-flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-muted " +
        (className ?? "")
      }
      aria-label="Basculer entre thème clair et sombre"
      data-testid="theme-toggle"
    >
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
    </button>
  );
}
