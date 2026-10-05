"use client";

// The Seamless Scheduler — booking form on the prism-gradient wash.
// Native date/time inputs styled to the reference's rounded-sm fields;
// POSTs to /api/appointments then routes to the confirmation page with the
// same query-string contract as the reference
// (/book/confirmation?name=&date=&time=&service=).
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { ServiceDto, StylistDto } from "@/lib/content";
import { formatPrice } from "@/lib/content";

const inputClass =
  "w-full bg-background/60 border border-foreground/10 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-foreground transition";

export function BookingForm({
  services,
  stylists,
}: {
  services: ServiceDto[];
  stylists: StylistDto[];
}) {
  const router = useRouter();
  const search = useSearchParams();

  const preService = search.get("service") ?? "";
  const preStylist = search.get("stylist") ?? "";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [stylist, setStylist] = React.useState(
    stylists.some((s) => s.slug === preStylist) ? preStylist : "",
  );
  const [service, setService] = React.useState(
    services.some((s) => s.slug === preService) ? preService : "",
  );
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          stylistSlug: stylist || null,
          serviceSlug: service,
          date,
          time,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `status ${res.status}`);
      }
      const params = new URLSearchParams({ name, date, time, service });
      router.push(`/book/confirmation?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "We couldn't submit your request — please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      className="glass border border-foreground/10 rounded-sm p-6 md:p-12 max-w-3xl mx-auto"
      onSubmit={onSubmit}
    >
      {/* The reference's form is a BLOCK-level glass card: the 7 fields nest
          inside a grid div, while the Notes label (mt-5) and the button row
          (mt-10) sit outside it as block siblings — live-measured session 8
          (docs/remediation-plan-session-8.md §5.2). */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Full name <span className="text-secondary">*</span>
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Email <span className="text-secondary">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Phone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
          />
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Stylist
          </span>
          <select
            value={stylist}
            onChange={(e) => setStylist(e.target.value)}
            className={inputClass}
          >
            <option value="">No preference</option>
            {stylists.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Service <span className="text-secondary">*</span>
          </span>
          <select
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} · {formatPrice(s.priceCents)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Preferred date <span className="text-secondary">*</span>
          </span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
            Preferred time <span className="text-secondary">*</span>
          </span>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block mt-5">
        <span className="block text-[10px] uppercase tracking-editorial text-foreground/60 mb-2">
          Notes
        </span>
        <textarea
          rows={4}
          placeholder="Anything we should know — inspiration, allergies, previous treatments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-[11px] uppercase tracking-editorial text-foreground/50 max-w-sm leading-relaxed">
          24-hour cancellation policy · Confirmation within 2 business hours
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-3 rounded-full bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-editorial hover:bg-secondary transition disabled:opacity-60"
        >
          {submitting ? "Requesting…" : "Request appointment"}
          {!submitting && <ArrowRight size={14} aria-hidden />}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
