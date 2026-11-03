import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center py-24">
      <Container size="narrow" className="text-center">
        <p className="font-display text-[clamp(5rem,3rem+10vw,10rem)] leading-none text-muted">
          4<span className="text-dev">0</span>
          <span className="text-architecture">4</span>
        </p>
        <h1 className="mt-6 text-h2">Cette page n&apos;existe pas (ou plus).</h1>
        <p className="mx-auto mt-4 max-w-lg text-lead text-muted">
          Le plan était peut-être mal coté. Revenez à l&apos;accueil ou explorez nos projets.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Retour à l&apos;accueil
          </Button>
          <Button href="/projets" variant="secondary">
            Voir les projets
          </Button>
        </div>
        <p className="mt-10 text-sm text-muted">
          Un lien cassé ?{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Signalez-le-nous
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
