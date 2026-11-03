"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Referme le menu mobile après une navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      {/* Fond flouté sur un calque à part : un backdrop-filter sur <header> deviendrait le bloc
          conteneur du menu mobile (position: fixed) et l'écraserait à la hauteur de l'en-tête. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 border-b border-border/70 bg-bg/85 backdrop-blur-md"
      />
      <Container size="wide" className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-surface-muted text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <span className="ml-2 hidden sm:block">
            <Button href="/contact" size="sm">
              Nous contacter
            </Button>
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface-muted lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="menu-mobile"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-border bg-bg lg:hidden"
      >
        <nav aria-label="Navigation mobile">
          <Container as="ul" className="flex flex-col gap-1 py-6">
            {siteConfig.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-3 font-display text-2xl",
                      active ? "bg-surface-muted" : "hover:bg-surface-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-6">
              <Button href="/contact" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Nous contacter
              </Button>
            </li>
          </Container>
        </nav>
      </div>
    </header>
  );
}
