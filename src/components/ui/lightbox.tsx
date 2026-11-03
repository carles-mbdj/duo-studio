"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type LightboxGalleryProps = {
  images: LightboxImage[];
  /** Nom de la galerie, annoncé aux lecteurs d'écran. */
  label: string;
  /** Mise en page des vignettes. */
  layout?: "grid" | "large";
  className?: string;
};

/**
 * Galerie de vignettes + visionneuse plein écran.
 * Repose sur <dialog> en mode modal : le reste de la page devient inerte (focus piégé),
 * Échap ferme la visionneuse, les flèches naviguent et le focus revient sur la vignette d'origine.
 */
export function LightboxGallery({
  images,
  label,
  layout = "grid",
  className,
}: LightboxGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [index, setIndex] = useState<number | null>(null);
  // Vignette qui a ouvert la visionneuse : le focus y revient à la fermeture.
  const openerRef = useRef<number | null>(null);

  const open = (i: number) => {
    openerRef.current = i;
    setIndex(i);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setIndex(null);
      const opener = openerRef.current;
      openerRef.current = null;
      if (opener !== null) {
        // Après le rendu (le contenu de la visionneuse est démonté).
        requestAnimationFrame(() => triggerRefs.current[opener]?.focus());
      }
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const current = index !== null ? images[index] : undefined;

  return (
    <>
      <ul
        aria-label={label}
        className={cn(
          "grid gap-x-4 gap-y-6 sm:grid-cols-2",
          layout === "grid" && "lg:grid-cols-3",
          layout === "large" && "lg:gap-x-6 lg:[&>li:nth-child(5n+1)]:col-span-2",
          className,
        )}
      >
        {images.map((image, i) => (
          <li key={image.src}>
            <figure>
              <button
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
                onClick={() => open(i)}
                className="group block w-full overflow-hidden rounded-2xl border border-border bg-surface-muted"
                aria-label={`Agrandir l'image ${i + 1} sur ${images.length} : ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt=""
                  width={1600}
                  height={1000}
                  sizes={
                    layout === "large"
                      ? "(min-width: 640px) 50vw, 100vw"
                      : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  }
                  className="h-auto w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
              </button>
              {image.caption && (
                <figcaption className="mt-2 text-sm text-muted">{image.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`Visionneuse : ${label}`}
        onKeyDown={onKeyDown}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/90 p-0 text-white backdrop:bg-black/70"
      >
        {current && index !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p aria-live="polite" className="text-sm text-white/80">
                Image {index + 1} sur {images.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Fermer la visionneuse"
                autoFocus
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:px-20">
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={1600}
                height={1000}
                sizes="100vw"
                className="h-auto max-h-[75dvh] w-auto max-w-full rounded-lg object-contain"
              />
              {current.caption && (
                <figcaption className="max-w-2xl text-center text-white/85">
                  {current.caption}
                </figcaption>
              )}
            </figure>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-3 hover:bg-white/15 sm:left-4"
                  aria-label="Image précédente"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-3 hover:bg-white/15 sm:right-4"
                  aria-label="Image suivante"
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
