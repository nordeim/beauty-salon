import type { Metadata } from "next";
import { ServicesExperience } from "@/components/ServicesExperience";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Our signature treatments — hair, skin, and nails at Maison Luminaire.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const services = await getServices();
  return <ServicesExperience services={services} initialCategory={category ?? "all"} />;
}
