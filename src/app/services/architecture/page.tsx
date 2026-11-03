import type { Metadata } from "next";
import { ServicesDomainPage } from "@/components/services/services-domain-page";

export const metadata: Metadata = {
  title: "Services Architecture & Design",
  description:
    "Plans de maison, modélisation 3D, relevé de l'existant et aménagement intérieur : détail des offres et tarifs indicatifs.",
  alternates: { canonical: "/services/architecture" },
};

export default function ArchitectureServicesPage() {
  return <ServicesDomainPage domain="architecture" />;
}
