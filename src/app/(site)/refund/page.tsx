import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { LEGAL_PAGES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund and cancellation terms.",
};

export default function Page() {
  return <LegalPage data={LEGAL_PAGES.refund} />;
}
