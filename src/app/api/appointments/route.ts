import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // The reference's wire schema (live-measured session 14 via request
  // capture): snake_case entity fields with "" for unset optionals and
  // status always "pending". The DB columns keep their own names — the
  // mapping happens here, at the wire boundary (parity at the observable
  // edge, substrate freedom behind it).
  const name = typeof body.client_name === "string" ? body.client_name.trim() : "";
  const email = typeof body.client_email === "string" ? body.client_email.trim() : "";
  const phone = typeof body.client_phone === "string" ? body.client_phone.trim() : "";
  const stylistSlug = typeof body.stylist_slug === "string" ? body.stylist_slug : "";
  const serviceSlug = typeof body.service_slug === "string" ? body.service_slug : "";
  const date = typeof body.requested_date === "string" ? body.requested_date : "";
  const time = typeof body.requested_time === "string" ? body.requested_time : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : "";
  const status = typeof body.status === "string" ? body.status.trim().slice(0, 30) : "";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Your full name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!serviceSlug) {
    return NextResponse.json({ error: "Please select a service." }, { status: 400 });
  }
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "A preferred date is required." }, { status: 400 });
  }
  if (!TIME_RE.test(time)) {
    return NextResponse.json({ error: "A preferred time is required." }, { status: 400 });
  }

  const service = await db.service.findUnique({ where: { slug: serviceSlug } });
  if (!service) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }

  let stylistId: string | null = null;
  if (stylistSlug) {
    const stylist = await db.stylist.findUnique({ where: { slug: stylistSlug } });
    if (!stylist) {
      return NextResponse.json({ error: "Unknown stylist." }, { status: 400 });
    }
    stylistId = stylist.id;
  }
  void stylistId; // reserved for future stylist-scoped scheduling

  try {
    await db.appointment.create({
      data: {
        name,
        email,
        phone: phone || null,
        stylistSlug: stylistSlug || null,
        serviceSlug,
        date,
        time,
        notes: notes || null,
        status: status || "pending",
      },
    });
  } catch (e) {
    console.error("[api/appointments] create failed:", e);
    return NextResponse.json(
      { error: "We couldn't save your request — please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
