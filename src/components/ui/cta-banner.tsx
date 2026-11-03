import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "./button";
import { Container } from "./container";

type CtaBannerProps = {
  title?: string;
  text?: string;
  href?: string;
  label?: string;
};

export function CtaBanner({
  title = "Parlons de votre projet",
  text = `Un site, un tableau de bord, des plans ou des rendus 3D ? Décrivez-nous votre besoin : nous répondons ${siteConfig.contact.responseTime}.`,
  href = "/contact",
  label = "Nous contacter",
}: CtaBannerProps) {
  return (
    <section aria-labelledby="cta-titre" className="py-16 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-fg px-6 py-14 text-bg sm:px-14 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-72 rounded-full bg-dev opacity-40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-16 size-72 rounded-full bg-architecture opacity-40 blur-3xl"
          />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 id="cta-titre" className="text-h2">
                {title}
              </h2>
              <p className="mt-4 text-lead opacity-80">{text}</p>
            </div>
            <Button
              href={href}
              size="lg"
              variant="secondary"
              className="shrink-0 border-bg bg-bg text-fg hover:text-fg"
            >
              {label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
