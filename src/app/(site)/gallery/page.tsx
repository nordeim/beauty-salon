import type { Metadata } from "next";
import { GalleryExperience } from "@/components/GalleryGrid";
import { getGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Transformations in lived-in light — color, cuts, bridal, nails, and skin.",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return <GalleryExperience items={items} />;
}
