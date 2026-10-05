import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Reveal } from "@/components/Reveal";
import { firstSentence, formatPrice, getService, getServices } from "@/lib/data";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  // The reference's title for the unknown-slug state is the SERVICES page
  // title ("Services | Beauty Salon", live-measured session 11).
  if (!service) return { title: "Services" };
  return { title: service.name, description: service.tagline };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  // The reference's unknown-slug state (live-measured session 11): a
  // DEDICATED "Service not found" section inside the site chrome — not
  // the generic slate 404. HTTP 200, the SERVICES page title, h1 + the
  // Return-to-the-almanac link. Deliberate soft-404-for-parity (the
  // reference behaves identically) — do not "fix" back to notFound().
  if (!service) {
    return (
      <section className="pt-40 px-6 max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-4xl mb-6">Service not found</h1>
        <Link className="text-[11px] uppercase tracking-editorial underline" href="/services" scroll={false}>
          Return to the almanac
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <Link
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/60 hover:text-foreground mb-12"
            href="/services"
            scroll={false}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to services
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <Reveal className="md:col-span-7">
              <h1 className="mt-6 font-serif text-6xl md:text-8xl leading-[0.92] tracking-tight text-balance">
                {service.name}
              </h1>
              <p className="mt-6 italic text-foreground/70 text-xl">{service.tagline}</p>
            </Reveal>
            <Reveal className="md:col-span-5 md:sticky md:top-28">
              <div className="glass border border-foreground/10 p-8 rounded-sm">
                <div className="text-[10px] uppercase tracking-editorial text-foreground/50">
                  Treatment card
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-5xl">{formatPrice(service.priceCents)}</span>
                  <span className="text-sm text-foreground/50">starting at</span>
                </div>
                <div className="mt-2 text-sm text-foreground/70">
                  {service.durationMin} minutes
                </div>
                <div className="mt-8">
                  <Link className="inline-block w-full" href={`/book?service=${service.slug}`} scroll={false}>
                    <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary w-full">
                      Book this treatment
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 px-3 md:px-6 bg-muted">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative aspect-[21/9] overflow-hidden">
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-28 px-3 md:px-6">
        <div className="max-w-[1000px] mx-auto">
          <Reveal>
            {/* The reference renders the FIRST SENTENCE of longDescription as
                this heading (live-measured 8/8) — not a composed name/tagline. */}
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-tight text-balance">
              {firstSentence(service.longDescription)}
            </h2>
          </Reveal>
          <Reveal>
            <p className="mt-10 text-foreground/75 leading-[1.8] text-[16px]">
              {service.longDescription}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 px-3 md:px-6 bg-accent/20">
        <div className="max-w-[1000px] mx-auto">
          <Reveal>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl">Before your visit</h2>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {service.prep.map((item, i) => (
              <Reveal key={item} delay={i * 60}>
                <li className="flex items-start gap-4 pb-5 border-b border-foreground/10">
                  <Check aria-hidden className="h-4 w-4 mt-1 text-secondary flex-shrink-0" />
                  <span className="text-foreground/80 leading-[1.6]">{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-28 px-3 md:px-6">
        <div className="max-w-[900px] mx-auto">
          <Reveal>
            <h2 className="mt-6 font-serif text-4xl md:text-6xl">Frequently asked.</h2>
          </Reveal>
          <FaqAccordion items={service.faqs} />
        </div>
      </section>

      <section className="py-24 px-3 md:px-6 bg-foreground text-background">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-7xl leading-[0.95]">Ready to begin?</h2>
          <p className="mt-6 text-background/70 max-w-md mx-auto">
            Reserve {service.name.toLowerCase()} with the next available stylist.
          </p>
          <div className="mt-10">
            <Link className="inline-block" href={`/book?service=${service.slug}`} scroll={false}>
              <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-background text-foreground hover:bg-accent">
                Book this treatment
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
