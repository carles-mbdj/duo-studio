import { ServicesDomainPage } from "@/components/services/services-domain-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services Informatique & Data",
  description:
    "Site vitrine, application web sur mesure, analyse de données et maintenance : détail des offres et tarifs indicatifs.",
  path: "/services/dev",
});

export default function DevServicesPage() {
  return <ServicesDomainPage domain="dev" />;
}
