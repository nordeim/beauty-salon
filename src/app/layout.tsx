import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
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
  title: {
    default: "Maison Luminaire — Beauty Salon",
    template: "%s | Beauty Salon",
  },
  description:
    "Boost your natural beauty. Hair, skin, and nails — a quiet practice in lower Manhattan. Book your treatment at Maison Luminaire.",
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
