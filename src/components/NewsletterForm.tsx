"use client";

// Newsletter form — POSTs to /api/newsletter. The state machine mirrors the
// reference exactly (live-measured session 12 + deobfuscated from its
// bundle): idle | loading | success, with the POST's FAILURE rendered as
// SUCCESS (the reference's `catch { → success }` — no error UI exists
// anywhere in its bundle). Do not "fix" this back to an error state.
import * as React from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "success">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      // The reference's wire payload (live-measured session 14 via request
      // capture): { email, source } — the source attribution marks the
      // homepage 15%-offer form. Key order included (devtools-visible).
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_15off" }),
      });
    } catch {
      // The reference swallows POST failures and renders the success state.
    }
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="mt-12">
        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-editorial text-secondary">
          <Check className="h-4 w-4" aria-hidden />
          {" You're in. Check your inbox for your 15% code."}
        </div>
      </div>
    );
  }

  return (
    <form className="mt-12 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={onSubmit}>
      {/* The aria-label is the clone's documented invisible-a11y addition —
          the reference's input is fully unlabeled (its own a11y failure). */}
      <input
        type="email"
        required
        placeholder="Your email"
        aria-label="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-background/60 backdrop-blur border border-foreground/15 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-foreground transition"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-[11px] uppercase tracking-editorial hover:bg-secondary transition disabled:opacity-60"
      >
        {state === "loading" ? "Sending..." : "Claim 15% off"}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </form>
  );
}
