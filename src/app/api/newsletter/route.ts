import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // The reference's wire payload carries a source attribution
  // ("homepage_15off" — live-measured session 14) and PERSISTS it on its
  // NewsletterSubscriber entity; the clone stores it the same way. Absent or
  // non-string values persist as null (direct API callers stay legal).
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 100) : null;

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email, source: source || null },
    });
  } catch (e) {
    console.error("[api/newsletter] upsert failed:", e);
    return NextResponse.json({ error: "Subscription failed — please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
