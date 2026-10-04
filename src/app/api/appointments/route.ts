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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const stylistSlug = typeof body.stylistSlug === "string" ? body.stylistSlug : "";
  const serviceSlug = typeof body.serviceSlug === "string" ? body.serviceSlug : "";
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : "";

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
