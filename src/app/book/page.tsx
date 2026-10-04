import type { Metadata } from "next";
import { Suspense } from "react";
import { BookHeader } from "@/components/layout/BookHeader";
import { BookingForm } from "@/components/BookingForm";
import { getServices, getStylists } from "@/lib/data";

export const metadata: Metadata = {
  title: "Book",
  description: "Reserve your ritual — book a treatment at Maison Luminaire.",
};

export default async function BookPage() {
  const [services, stylists] = await Promise.all([getServices(), getStylists()]);

  return (
    <>
      <BookHeader />
      <main className="flex-1">
        <section className="min-h-screen pt-28 md:pt-32 pb-20 prism-gradient">
          <div className="max-w-[1200px] mx-auto px-3 md:px-6">
            <div className="text-center mb-14">
              <div className="text-[11px] uppercase tracking-editorial text-foreground/60 mb-6">
                — The Seamless Scheduler
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Reserve your <span className="italic text-secondary">ritual.</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-foreground/70">
                Share a few details and we&apos;ll confirm your appointment within business hours.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="glass border border-foreground/10 rounded-sm p-6 md:p-12 max-w-3xl mx-auto h-[560px]" />
              }
            >
              <BookingForm services={services} stylists={stylists} />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
