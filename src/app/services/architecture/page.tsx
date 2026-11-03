import { ServicesDomainPage } from "@/components/services/services-domain-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services Architecture & Design",
  description:
    "Plans de maison, modélisation 3D, relevé de l'existant et aménagement intérieur : détail des offres et tarifs indicatifs.",
  path: "/services/architecture",
});

export default function ArchitectureServicesPage() {
  return <ServicesDomainPage domain="architecture" />;
}
