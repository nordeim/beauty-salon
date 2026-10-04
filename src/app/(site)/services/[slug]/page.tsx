import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { formatPrice, getService, getServices } from "@/lib/data";

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
  if (!service) return { title: "Service" };
  return { title: service.name, description: service.tagline };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <section className="pt-32 md:pt-40 pb-16 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <Link
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/60 hover:text-foreground mb-12"
            href="/services"
          >
            <ArrowLeft size={14} aria-hidden />
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
                  <Link className="inline-block w-full" href={`/book?service=${service.slug}`}>
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
            <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-tight text-balance">
              {service.name} — {service.tagline.replace(/\.$/, "")}.
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
          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {service.prep.map((item, i) => (
              <Reveal as="li" key={item} className="flex items-start gap-4" delay={i * 60}>
                <span className="text-[11px] uppercase tracking-editorial text-foreground/50 mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground/75 leading-[1.7]">{item}</span>
              </Reveal>
            ))}
          </ul>
          <div className="mt-16">
            <Link className="inline-block" href={`/book?service=${service.slug}`}>
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-editorial hover:bg-secondary transition">
                Book this treatment
                <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
