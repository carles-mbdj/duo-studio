import type { Metadata } from "next";
import { ServicesDomainPage } from "@/components/services/services-domain-page";

export const metadata: Metadata = {
  title: "Services Informatique & Data",
  description:
    "Site vitrine, application web sur mesure, analyse de données et maintenance : détail des offres et tarifs indicatifs.",
  alternates: { canonical: "/services/dev" },
};

export default function DevServicesPage() {
  return <ServicesDomainPage domain="dev" />;
}
