// The /book + /book/confirmation header — always-glass, h-16, with the
// "← Return to site" back link and a trailing spacer (reference layout).
import Link from "next/link";

export function BookHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-foreground/5">
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 h-16 flex items-center justify-between">
        <Link
          className="text-[11px] uppercase tracking-editorial text-foreground/70 hover:text-foreground transition"
          href="/"
        >
          ← Return to site
        </Link>
        <Link className="font-serif text-xl" href="/">
          Maison Luminaire
        </Link>
        <span className="w-24" aria-hidden />
      </div>
    </header>
  );
}
