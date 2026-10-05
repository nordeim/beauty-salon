// Shared DTO shapes + pure formatting — importable from CLIENT components
// (deliberately free of any db/node imports; the server-side read seam is
// src/lib/data.ts).
export interface FaqItem {
  q: string;
  a: string;
}

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
  faqs: FaqItem[];
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

// The service detail page's description heading: the reference renders the
// FIRST SENTENCE of longDescription as the giant serif H2 (live-measured 8/8
// — e.g. "Our Signature Balayage is a freehand color application performed by
// our master colorists."), with the full paragraph repeated below. Splits at
// the first ". " boundary; returns the whole text when there is none.
export function firstSentence(text: string): string {
  const boundary = text.indexOf(". ");
  return boundary === -1 ? text : text.slice(0, boundary + 1);
}
