import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_PAGES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms & Conditions for Maison Luminaire services.",
};

export default function Page() {
  return <LegalPage data={LEGAL_PAGES.terms} />;
}
