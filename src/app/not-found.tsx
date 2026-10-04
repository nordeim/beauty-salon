// 404 — the reference's not-found surface: site chrome + big "404" +
// "Page Not Found" + a Go Home button.
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="pt-40 md:pt-52 pb-32 px-3 md:px-6">
          <div className="max-w-[1400px] mx-auto text-center">
            <h1 className="mt-6 font-serif text-[20vw] md:text-[12rem] leading-[0.9] tracking-tight">
              404
            </h1>
            <h2 className="mt-6 font-serif text-3xl md:text-5xl italic text-secondary">
              Page Not Found
            </h2>
            <p className="mt-8 text-foreground/70 max-w-md mx-auto leading-[1.7]">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="mt-12">
              <Link
                className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary"
                href="/"
              >
                Go Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
