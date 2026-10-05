// Landing page — seven sections in the reference's contractual order:
// prism hero → three disciplines → story → full-bleed interior → testimonial
// carousel → instagram grid → newsletter. Every section's class set mirrors
// the extracted reference DOM (research/target-app-spec.md).
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Instagram } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getGallery, getTestimonials } from "@/lib/data";

const CATEGORY_CARDS = [
  {
    index: "01 / Category",
    name: "Hair",
    tagline: "Color, cut, and editorial craft.",
    description:
      "Balayage, precision cuts, gloss, and bridal styling — designed to grow out beautifully.",
    href: "/services?category=hair",
    image: "/images/category-hair.png",
    alt: "Hair",
  },
  {
    index: "02 / Category",
    name: "Skin",
    tagline: "Clinical care, editorial glow.",
    description:
      "HydraFacial protocols, bespoke facials, and corrective skin treatments led by licensed estheticians.",
    href: "/services?category=skin",
    image: "/images/category-skin.png",
    alt: "Skin",
  },
  {
    index: "03 / Category",
    name: "Nails",
    tagline: "Considered hands, elevated details.",
    description:
      "Luxe gel manicures, pedicures, and minimalist nail art in a quiet, focused environment.",
    href: "/services?category=nails",
    image: "/images/category-nails.png",
    alt: "Nails",
  },
] as const;

export default async function LandingPage() {
  const [testimonials, gallery] = await Promise.all([getTestimonials(), getGallery()]);
  const instagramTiles = gallery.slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden prism-gradient">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-3 md:px-6 pt-40 md:pt-48 pb-20 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-24 items-center">
          <div className="md:col-span-7">
            <p className="mb-6 text-[12px] uppercase tracking-editorial text-black/60">
              Aesthetics &amp; wellness
            </p>
            <h1 className="font-serif text-[13vw] md:text-[8vw] leading-[0.92] tracking-tight text-black">
              <span className="block">Boost Your</span>
              <span className="block italic">Natural Beauty</span>
            </h1>
          </div>
          <div className="md:col-span-5 relative">
            {/* The reference's animation framework neutralizes the scale-125
                class at settle (inline transform: none — live-measured
                session 10: the box renders at its layout size 457×610
                @1280 / 366×488 @390) while the IMG itself settles at
                scale(1.08), cropped by the overflow-hidden. The settled
                inline styles below replicate that rest state; the class
                attribute keeps scale-125 (the reference's DOM carries it
                too). TRAP 8 (session 10): v4's scale-125 writes the
                INDIVIDUAL `scale` property, not `transform` — so
                replicating the reference's inline `transform: none` alone
                would NOT neutralize it (the box would stay 25% too
                large). `scale: "none"` is the v4-side neutralization; the
                other two properties replicate the reference's settled
                string verbatim. Do not remove either. */}
            <div
              className="relative aspect-[3/4] overflow-hidden scale-125 origin-center"
              style={{ opacity: 1, filter: "blur(0px)", transform: "none", scale: "none" }}
            >
              <Image
                src="/images/hero-portrait.png"
                alt="Luminous portrait"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                style={{ transform: "scale(1.08)" }}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5" aria-hidden />
            </div>
            <div className="hidden md:flex absolute -left-14 bottom-6">
              <Link
                className="flex items-center justify-center h-28 w-28 rounded-full bg-foreground text-background text-[10px] uppercase tracking-editorial shadow-2xl hover:scale-105 transition-transform duration-300 text-center leading-tight px-3"
                href="/book"
              >
                Book a Treatment
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-editorial text-foreground/40">
          Scroll to explore ↓
        </div>
      </section>

      {/* ── Three disciplines ────────────────────────────────────────── */}
      <section className="relative py-28 md:py-40">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <Reveal>
              <h2 className="mt-5 font-serif text-5xl md:text-7xl leading-[0.95] text-balance max-w-3xl">
                Three disciplines
                <br />
                <span className="italic text-secondary">One quiet practice</span>
              </h2>
            </Reveal>
            <Reveal>
              <div className="max-w-sm text-foreground/70 leading-[1.6]">
                Every service at Maison Luminaire is designed especially for you with signature
                products, and an outcome that feels inevitably right.
              </div>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10">
            {CATEGORY_CARDS.map((card) => (
              <div key={card.name} className="bg-background">
                <Link className="group block relative overflow-hidden" href={card.href}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {/* `duration-s]` below is the REFERENCE'S OWN corrupted
                        class token (a template-literal artifact — it generates
                        no CSS in the base44 build), so transition-transform's
                        built-in default stands: 150ms + the default ease curve
                        (live-measured session 10). The dead-on-live ease-[…]
                        sibling token is dropped — it WOULD generate in the
                        clone's v4 build and change the computed timing.
                        Do not "fix" duration-s] to duration-700. */}
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-editorial text-foreground/50 mb-3">
                          {card.index}
                        </div>
                        <h3 className="font-serif text-4xl md:text-5xl">{card.name}</h3>
                        <div className="italic text-foreground/70 mt-2">{card.tagline}</div>
                      </div>
                      <ArrowUpRight
                        className="h-5 w-5 mt-2 text-foreground/40 transition-all group-hover:rotate-45 group-hover:text-foreground"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-6 text-sm text-foreground/70 leading-[1.7] max-w-xs">
                      {card.description}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10 items-center">
          <Reveal className="md:col-span-5">
            <h2 className="font-serif text-5xl md:text-6xl leading-[0.95] text-balance">
              Results-driven treatments
              <br />
              <span className="italic text-secondary">that center your natural beauty</span>
            </h2>
          </Reveal>
          <Reveal className="md:col-span-7 space-y-6 text-foreground/75 text-[16px] leading-[1.8]">
            <p>
              Maison Luminaire was founded on a simple observation, the beauty industry had
              collapsed its two oldest traditions the atelier and the apothecary into something
              neither. We wanted to build back the sanctuary.
            </p>
            <p>
              Ten years on, our studio is a quiet ground-floor space in lower Manhattan. Our
              stylists and estheticians train in clinical and editorial disciplines. Every service
              is a considered ritual from consultation to finish.
            </p>
            <Link
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground hover:text-secondary transition"
              href="/about"
            >
              Read our full story
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Full-bleed interior ──────────────────────────────────────── */}
      <section className="relative w-full h-[600px] md:h-screen overflow-hidden bg-muted">
        <Image
          src="/images/salon-interior.png"
          alt="Maison Luminaire salon interior"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-40 bg-secondary/5">
        <TestimonialCarousel items={testimonials} />
      </section>

      {/* ── Instagram ────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <Reveal>
              <h2 className="mt-5 font-serif text-4xl md:text-6xl">@maisonluminaire</h2>
            </Reveal>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/70 hover:text-foreground"
            >
              <Instagram className="h-4 w-4" aria-hidden />
              Follow along
            </a>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {instagramTiles.map((tile) => (
              <Reveal key={tile.title}>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="group block relative aspect-square overflow-hidden"
                  aria-label={tile.title}
                >
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-center justify-center">
                    <Instagram
                      className="h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      aria-hidden
                    />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-40 bg-accent/30 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/50 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-[900px] mx-auto px-3 md:px-6 text-center">
          <Reveal>
            <h2 className="mt-6 font-serif text-5xl md:text-7xl leading-[0.95] text-balance">
              Join the atelier
              <br />
              <span className="italic text-secondary">Receive 15% off</span>
              <br />
              your first visit
            </h2>
            <p className="mt-8 max-w-md mx-auto text-foreground/70 leading-[1.6]">
              A short letter every few weeks detailing new services, seasonal rituals, and stylist
              availability before anyone else
            </p>
          </Reveal>
          <Reveal delay={100}>
            <NewsletterForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
