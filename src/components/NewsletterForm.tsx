"use client";

// Newsletter form — POSTs to /api/newsletter, success state mirrors the
// reference's inline confirmation behavior.
import * as React from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-12">
        <p className="text-[11px] uppercase tracking-editorial text-foreground/70">
          Welcome to the atelier — your 15% code is on its way.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-12 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={onSubmit}>
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
        {state === "loading" ? "Claiming…" : "Claim 15% off"}
        {state === "loading" ? null : <ArrowRight size={14} aria-hidden />}
      </button>
      {state === "error" && (
        <p role="status" className="text-sm text-foreground/70 sm:absolute sm:-bottom-8">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
