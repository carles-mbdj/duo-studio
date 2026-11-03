import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

// Page d'accueil provisoire : la version complète arrive à l'étape « Pages ».
export default function HomePage() {
  return (
    <Section
      headingLevel="h1"
      title="Deux ingénieurs, deux regards, un studio."
      intro="Du code et des données d'un côté, des plans et des volumes de l'autre."
    >
      <div className="flex flex-wrap gap-3">
        <div className="accent-dev">
          <Button href="/dev">{siteConfig.categories.dev.label}</Button>
        </div>
        <div className="accent-architecture">
          <Button href="/architecture">{siteConfig.categories.architecture.label}</Button>
        </div>
      </div>
    </Section>
  );
}
