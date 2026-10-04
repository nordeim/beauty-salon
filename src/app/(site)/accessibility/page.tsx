import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_PAGES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to an accessible site.",
};

export default function Page() {
  return <LegalPage data={LEGAL_PAGES.accessibility} />;
}
