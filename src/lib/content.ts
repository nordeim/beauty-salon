// Shared DTO shapes + pure formatting — importable from CLIENT components
// (deliberately free of any db/node imports; the server-side read seam is
// src/lib/data.ts).
export interface ServiceDto {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  longDescription: string;
  priceCents: number;
  durationMin: number;
  prep: string[];
  image: string;
}

export interface StylistDto {
  slug: string;
  name: string;
  title: string;
  eyebrow: string;
  bio1: string;
  bio2: string;
  imageGray: string;
  imageColor: string;
}

export interface GalleryDto {
  title: string;
  category: string;
  description: string;
  image: string;
  fullImage: string;
}

export interface TestimonialDto {
  quote: string;
  attribution: string;
}

export function formatPrice(cents: number): string {
  const d = cents / 100;
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`;
}
