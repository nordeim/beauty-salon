import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_PAGES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Maison Luminaire handles your data.",
};

export default function Page() {
  return <LegalPage data={LEGAL_PAGES.privacy} />;
}
