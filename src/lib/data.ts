// Server-side data access — the single read seam for marketing content.
// Types + formatPrice live in ./content (client-safe); this module owns the
// Prisma reads and must never be imported from a client component.
import { db } from "./db";
import type { FaqItem, ServiceDto, StylistDto, GalleryDto, TestimonialDto } from "./content";

export { formatPrice, firstSentence } from "./content";
export type { FaqItem, ServiceDto, StylistDto, GalleryDto, TestimonialDto } from "./content";

export async function getServices(category?: string): Promise<ServiceDto[]> {
  const rows = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const mapped = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category,
    tagline: r.tagline,
    description: r.description,
    longDescription: r.longDescription,
    priceCents: r.priceCents,
    durationMin: r.durationMin,
    prep: safeParse(r.prep),
    faqs: safeParseFaqs(r.faqs),
    image: r.image,
  }));
  if (!category || category === "all") return mapped;
  return mapped.filter((s) => s.category === category);
}

export async function getService(slug: string): Promise<ServiceDto | null> {
  const rows = await getServices();
  return rows.find((s) => s.slug === slug) ?? null;
}

export async function getStylists(): Promise<StylistDto[]> {
  const rows = await db.stylist.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    title: r.title,
    eyebrow: r.eyebrow,
    bio1: r.bio1,
    bio2: r.bio2,
    imageGray: r.imageGray,
    imageColor: r.imageColor,
  }));
}

export async function getGallery(): Promise<GalleryDto[]> {
  const rows = await db.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({
    title: r.title,
    category: r.category,
    description: r.description,
    image: r.image,
    fullImage: r.fullImage,
  }));
}

export async function getTestimonials(): Promise<TestimonialDto[]> {
  const rows = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => ({ quote: r.quote, attribution: r.attribution }));
}

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

// The FAQ column mirrors the prep pattern (JSON array in a text column);
// entries are { q, a } objects — anything else is dropped rather than
// trusted, per the API-body narrowing convention.
function safeParseFaqs(json: string): FaqItem[] {
  try {
    const v: unknown = JSON.parse(json);
    if (!Array.isArray(v)) return [];
    return v.flatMap((item): FaqItem[] => {
      if (typeof item !== "object" || item === null) return [];
      const { q, a } = item as Record<string, unknown>;
      if (typeof q !== "string" || typeof a !== "string") return [];
      return [{ q, a }];
    });
  } catch {
    return [];
  }
}
