// Seed — mirrors the reference app's content exactly (extracted 2026-10-05).
// Idempotent: natural-key upserts, safe to run repeatedly.
// The demo user carries the reference account's credentials so the clone's
// login flow can be exercised end-to-end (documented in README).
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const db = new PrismaClient();

const json = (v: string[]) => JSON.stringify(v);
const jsonFaqs = (v: { q: string; a: string }[]) => JSON.stringify(v);

// FAQ content extracted item-by-item from the live reference's accordion
// (session 7, agent-browser — exclusive-open disclosure, answers revealed
// by clicking each question in turn).

const services = [
  {
    slug: "balayage",
    name: "Signature Balayage",
    category: "hair",
    tagline: "Hand-painted dimension, sun-kissed finish.",
    description:
      "A bespoke hair-painting technique that delivers soft, natural-looking highlights tailored to your face and lifestyle.",
    longDescription:
      "Our Signature Balayage is a freehand color application performed by our master colorists. Each strand is hand-selected and painted to create movement, dimension, and a finish that grows out beautifully for up to four months. Includes consultation, color service, gloss treatment, bespoke blow-dry, and styling.",
    priceCents: 28500,
    durationMin: 210,
    prep: json([
      "Arrive with hair washed 24–48 hours prior",
      "Bring reference images if helpful",
      "Skip heavy oils or leave-ins the day of your appointment",
      "Plan for up to 4 hours in the chair",
    ]),
    image: "/images/service-balayage.png",
    faqs: jsonFaqs([
      { q: "How long does balayage last?", a: "Depending on home care, most clients return every 10–14 weeks for a refresh." },
      { q: "Will it damage my hair?", a: "We use bond-building systems throughout the service to preserve integrity and shine." },
      { q: "Can I do this on dark hair?", a: "Absolutely — we customize lift levels to create dimension on any base tone." },
    ]),
    sortOrder: 1,
  },
  {
    slug: "precision-cut",
    name: "Precision Cut & Finish",
    category: "hair",
    tagline: "Architecture for your hair.",
    description: "A considered cut built around your bone structure, texture, and daily rituals.",
    longDescription:
      "Every Precision Cut begins with a 15-minute consultation to understand your lifestyle, styling routine, and the silhouette you want to live in. Includes shampoo, scalp massage, cut, and a signature blow-dry.",
    priceCents: 12000,
    durationMin: 75,
    prep: json([
      "Wear something you'd normally wear",
      "Come with hair styled as you usually do",
      "Bring inspiration — we love collaboration",
    ]),
    image: "/images/service-precision-cut.png",
    faqs: jsonFaqs([
      { q: "How often should I cut?", a: "We typically recommend every 8–10 weeks for shape retention." },
    ]),
    sortOrder: 2,
  },
  {
    slug: "glossing-treatment",
    name: "Luminous Gloss",
    category: "hair",
    tagline: "Liquid light for your hair.",
    description: "A shine-enhancing, tone-refining gloss that restores vibrancy between color appointments.",
    longDescription:
      "This 45-minute treatment refreshes tone, seals the cuticle, and adds mirror-like shine. Perfect between balayage visits or as a standalone glow-up.",
    priceCents: 8500,
    durationMin: 45,
    prep: json([
      "Arrive with clean, dry hair",
      "Avoid silicone-heavy products 24 hours prior",
    ]),
    image: "/images/service-balayage.png",
    faqs: jsonFaqs([
      { q: "Is it a permanent color?", a: "Gloss is semi-permanent and fades gracefully over 4–6 weeks." },
    ]),
    sortOrder: 3,
  },
  {
    slug: "hydrafacial",
    name: "The HydraFacial Ritual",
    category: "skin",
    tagline: "Clinical hydration, editorial glow.",
    description: "A multi-step resurfacing treatment that cleanses, extracts, and infuses skin with potent serums.",
    longDescription:
      "Our signature 60-minute HydraFacial Ritual includes a lymphatic primer, deep cleanse, gentle exfoliation, painless extractions, antioxidant infusion, and a finishing LED therapy. You'll leave with skin that feels quieter, brighter, and profoundly hydrated.",
    priceCents: 24500,
    durationMin: 60,
    prep: json([
      "Avoid retinoids for 3 days before",
      "Come with a bare face if possible",
      "Stay hydrated the morning of",
      "Skip exfoliating acids 48 hours prior",
    ]),
    image: "/images/service-hydrafacial.png",
    faqs: jsonFaqs([
      { q: "How often should I get a HydraFacial?", a: "Most clients benefit from a treatment every 4 weeks." },
      { q: "Is there any downtime?", a: "None — your skin will look radiant immediately after." },
      { q: "Can I wear makeup after?", a: "We recommend waiting 4–6 hours so serums can fully absorb." },
    ]),
    sortOrder: 4,
  },
  {
    slug: "signature-facial",
    name: "Signature Bespoke Facial",
    category: "skin",
    tagline: "An hour of considered ritual.",
    description: "A fully customized facial tailored to your skin on the day.",
    longDescription:
      "We begin with a thorough skin analysis, then design a 75-minute protocol that may include enzyme exfoliation, high-frequency therapy, a bespoke mask, and facial massage.",
    priceCents: 18500,
    durationMin: 75,
    prep: json([
      "Arrive with clean skin",
      "Let us know about any recent treatments",
    ]),
    image: "/images/category-skin.png",
    faqs: jsonFaqs([
      { q: "Is this good for sensitive skin?", a: "Yes — every protocol is adjusted to your skin's tolerance." },
    ]),
    sortOrder: 5,
  },
  {
    slug: "gel-manicure",
    name: "Luxe Gel Manicure",
    category: "nails",
    tagline: "Two weeks of flawless finish.",
    description: "A refined manicure with long-wear gel polish and a hand ritual.",
    longDescription:
      "Includes shape, cuticle care, a warm hand soak, exfoliation, massage with nourishing balm, and gel polish application in your chosen shade.",
    priceCents: 7500,
    durationMin: 60,
    prep: json([
      "Remove previous polish or let us know to include removal",
      "Bring a reference if you have one",
    ]),
    image: "/images/service-gel-manicure.png",
    faqs: jsonFaqs([
      { q: "How long does gel last?", a: "Typically 2–3 weeks with proper home care." },
    ]),
    sortOrder: 6,
  },
  {
    slug: "signature-pedicure",
    name: "Signature Spa Pedicure",
    category: "nails",
    tagline: "A ritual of renewal from the ground up.",
    description: "An elevated pedicure experience with warm soak, exfoliation, and meticulous polish.",
    longDescription:
      "Our 75-minute Signature Spa Pedicure begins with a warm herbal foot soak, followed by expert shaping, cuticle care, a revitalizing sugar scrub, and an extended massage with shea butter. Finished with your choice of classic or gel polish.",
    priceCents: 9500,
    durationMin: 75,
    prep: json([
      "Remove existing polish before arrival",
      "Wear open-toed shoes",
      "Let us know of any skin sensitivities",
    ]),
    image: "/images/service-signature-pedicure.png",
    faqs: jsonFaqs([
      { q: "How long does a pedicure last?", a: "With gel polish, expect 3–4 weeks of flawless wear." },
    ]),
    sortOrder: 7,
  },
  {
    slug: "bridal-package",
    name: "Bridal Atelier",
    category: "hair",
    tagline: "A curated day of becoming.",
    description: "A full-service bridal package including trial, day-of hair and makeup.",
    longDescription:
      "Designed for the bride who wants to feel unmistakably herself. Includes a 2-hour trial session, wedding-day styling, and a touch-up kit.",
    priceCents: 75000,
    durationMin: 180,
    prep: json([
      "Book trial 4–6 weeks before",
      "Bring veil or accessories",
      "Share your dress neckline",
    ]),
    image: "/images/gallery-bridal-chignon.png",
    faqs: jsonFaqs([
      { q: "Do you travel?", a: "Yes, on-location services are available with a travel fee." },
    ]),
    sortOrder: 8,
  },
];

const stylists = [
  {
    slug: "amelia-voss",
    name: "Amelia Voss",
    title: "Master Colorist & Creative Director",
    years: 14,
    eyebrow: "01 / 14 yrs",
    bio1:
      "With 14 years and training at Vidal Sassoon London, Amelia is known for her painterly approach to balayage.",
    bio2:
      "She builds color stories that feel inevitably right — dimensional, personal, and impossibly natural.",
    imageGray: "/images/team-amelia-gray.png",
    imageColor: "/images/team-amelia-color.png",
    sortOrder: 1,
  },
  {
    slug: "julian-reyes",
    name: "Julian Reyes",
    title: "Senior Stylist",
    years: 9,
    eyebrow: "02 / 9 yrs",
    bio1: "Julian's precision cutting has been featured in three international editorials.",
    bio2: "His work is architectural — built around the way you actually live.",
    imageGray: "/images/team-julian-gray.png",
    imageColor: "/images/team-julian-color.png",
    sortOrder: 2,
  },
  {
    slug: "nadia-okafor",
    name: "Nadia Okafor",
    title: "Lead Esthetician",
    years: 11,
    eyebrow: "03 / 11 yrs",
    bio1:
      "A licensed medical esthetician, Nadia brings a clinical sensibility to every facial.",
    bio2:
      "Her HydraFacial protocols are the reason many of our clients travel across the city.",
    imageGray: "/images/team-nadia-gray.png",
    imageColor: "/images/team-nadia-color.png",
    sortOrder: 3,
  },
];

const gallery = [
  { title: "Radiance Facial", category: "skin", description: "Hydrating vitamin C facial with luminous results.", image: "/images/gallery-radiance-facial.png", fullImage: "/images/gallery-radiance-facial.png" },
  { title: "Bridal Chignon", category: "bridal", description: "Low chignon with pearl detailing.", image: "/images/gallery-bridal-chignon.png", fullImage: "/images/gallery-bridal-chignon.png" },
  { title: "Architectural Bob", category: "cuts", description: "A sharp, glossy one-length bob.", image: "/images/gallery-architectural-bob.png", fullImage: "/images/gallery-architectural-bob.png" },
  { title: "Copper Renaissance", category: "color", description: "Rich, dimensional copper with gloss finish.", image: "/images/gallery-copper-renaissance.png", fullImage: "/images/gallery-copper-renaissance.png" },
  { title: "Minimalist Manicure", category: "nails", description: "Nude French with subtle glow.", image: "/images/gallery-minimalist-manicure.png", fullImage: "/images/gallery-minimalist-manicure.png" },
  { title: "Luminous Complexion", category: "skin", description: "Post-HydraFacial glow.", image: "/images/gallery-luminous-complexion.png", fullImage: "/images/gallery-luminous-complexion-full.png" },
  { title: "Layered Texture", category: "cuts", description: "Soft curtain layers on caramel hair.", image: "/images/gallery-layered-texture.png", fullImage: "/images/gallery-layered-texture.png" },
  { title: "Soft Wave Bride", category: "bridal", description: "Undone bridal waves.", image: "/images/gallery-soft-wave-bride.png", fullImage: "/images/gallery-soft-wave-bride.png" },
  { title: "Chrome Manicure", category: "nails", description: "Subtle chrome finish on nude gel.", image: "/images/gallery-chrome-manicure.png", fullImage: "/images/gallery-chrome-manicure.png" },
  { title: "Chocolate Balayage", category: "color", description: "Rich chocolate tones with soft dimension.", image: "/images/gallery-chocolate-balayage.png", fullImage: "/images/gallery-chocolate-balayage.png" },
  { title: "Calming Ritual", category: "skin", description: "Calming green tea mask treatment.", image: "/images/gallery-calming-ritual.png", fullImage: "/images/gallery-calming-ritual.png" },
  { title: "LED Therapy", category: "skin", description: "Revitalizing LED light therapy facial.", image: "/images/gallery-led-therapy.png", fullImage: "/images/gallery-led-therapy-full.png" },
];

const testimonials = [
  {
    quote:
      "Amelia didn't give me a hair color — she gave me a version of myself I didn't know I was looking for. Four months later, it still looks effortless.",
    attribution: "ELENA M. · SIGNATURE BALAYAGE",
    sortOrder: 1,
  },
  {
    quote:
      "Julian asked me more thoughtful questions in ten minutes than any stylist has in a decade. The cut has held its shape through three weeks of travel.",
    attribution: "TOBIAS R. · PRECISION CUT",
    sortOrder: 2,
  },
  {
    quote:
      "I walked out feeling like my skin had exhaled. Nadia is equal parts clinician and artist — a rare combination.",
    attribution: "PRIYA S. · HYDRAFACIAL RITUAL",
    sortOrder: 3,
  },
  {
    quote:
      "My wedding day felt like a continuation of myself, not a costume. I can't think of a higher compliment for a bridal stylist.",
    attribution: "MARGOT L. · BRIDAL ATELIER",
    sortOrder: 4,
  },
];

async function main() {
  for (const s of services) {
    await db.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }
  for (const s of stylists) {
    await db.stylist.upsert({ where: { slug: s.slug }, update: s, create: s });
  }
  let i = 1;
  for (const g of gallery) {
    // No natural key on GalleryItem — delete-and-recreate preserves order deterministically.
    await db.galleryItem.deleteMany({ where: { title: g.title } });
    await db.galleryItem.create({ data: { ...g, sortOrder: i++ } });
  }
  for (const t of testimonials) {
    await db.testimonial.deleteMany({ where: { attribution: t.attribution } });
    await db.testimonial.create({ data: t });
  }
  const demoEmail = "sepnetflix2023@outlook.com";
  const demoUser = await db.user.findUnique({ where: { email: demoEmail } });
  if (!demoUser) {
    await db.user.create({
      data: {
        email: demoEmail,
        name: "Maison Concierge Demo",
        passwordHash: hashPassword(process.env.DEMO_USER_PASSWORD ?? "$Abcd1234"),
      },
    });
  }
  const counts = {
    services: await db.service.count(),
    stylists: await db.stylist.count(),
    gallery: await db.galleryItem.count(),
    testimonials: await db.testimonial.count(),
    users: await db.user.count(),
  };
  console.log("[seed] done:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
