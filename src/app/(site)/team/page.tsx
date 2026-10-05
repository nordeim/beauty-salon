import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { getStylists } from "@/lib/data";

export const metadata: Metadata = {
  title: "Atelier",
  description: "The hands behind the work — meet the Maison Luminaire team.",
};

export default async function TeamPage() {
  const stylists = await getStylists();

  return (
    <>
      <section className="pt-40 md:pt-52 pb-16 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="mt-6 font-serif text-6xl md:text-[8.5rem] leading-[0.92] tracking-tight text-balance">
            The hands behind
            <br />
            <span className="italic text-secondary">the work</span>
          </h1>
          <div className="mt-10 max-w-lg text-foreground/70 leading-[1.7]">
            Our team is small by design. Each stylist carries a distinct point of view and a shared
            belief that your time is sacred.
          </div>
        </div>
      </section>

      <section className="pb-28 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10">
          {stylists.map((s) => (
            <div key={s.slug} className="bg-background">
              <article className="group relative p-6 md:p-8">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={s.imageGray}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover grayscale transition-opacity duration-700 group-hover:opacity-0"
                  />
                  <Image
                    src={s.imageColor}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                </div>
                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-editorial text-foreground/50">
                    {s.eyebrow}
                  </div>
                  <h3 className="mt-3 font-serif text-3xl">{s.name}</h3>
                  <div className="italic text-foreground/70 mt-1 text-sm">{s.title}</div>
                  <div className="mt-5 text-sm text-foreground/70 leading-[1.7] space-y-3">
                    <p>{s.bio1}</p>
                    <p>{s.bio2}</p>
                  </div>
                  <Link
                    className="mt-6 inline-flex items-center justify-between w-full gap-2 group/btn rounded-full border border-foreground/20 px-5 py-3 text-[11px] uppercase tracking-editorial hover:bg-foreground hover:text-background transition-colors duration-500"
                    href={`/book?stylist=${s.slug}`}
                    scroll={false}
                  >
                    Book with {s.name.split(" ")[0]}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-45" aria-hidden />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
