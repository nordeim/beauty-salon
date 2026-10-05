import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// The reference app pairs Cormorant Garamond (display serif) with Mulish
// (UI sans). next/font self-hosts both, eliminating the external Google
// Fonts request the reference makes.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Maison Luminaire — Beauty Salon",
    template: "%s | Beauty Salon",
  },
  description:
    "Boost your natural beauty. Hair, skin, and nails — a quiet practice in lower Manhattan. Book your treatment at Maison Luminaire.",
  // The reference's head declares its favicon (the same logo asset the
  // clone self-hosts — the type="image/svg+xml" hint is the reference's
  // own artifact; it serves a PNG) and a manifest link whose target is
  // DEAD on the reference (the base44 SPA fallback HTML — an invalid
  // manifest). The clone mirrors both: the link is declared, the target
  // 404s — functionally identical "no PWA". Do not add a real manifest
  // file: it would EXCEED the reference (a divergence the other way).
  // The og:*/twitter:*/PWA metas on the reference are base44 platform
  // boilerplate — an accepted divergence (documented, session 10).
  icons: { icon: { url: "/images/logo.png", type: "image/svg+xml" } },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${mulish.variable}`}>
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased">
        {/* No-JS visitors see scroll-reveal content immediately — the
            entrance animation is a JS enhancement, not a content gate. */}
        <noscript>
          <style>{`.reveal-hidden{opacity:1 !important;filter:none !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
