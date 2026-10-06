// ICS calendar file generation — reproduces the reference confirmation page's
// "Add to calendar" data-URI download. Pure and unit-tested (tests/ics.test.ts).

export interface IcsInput {
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** 24h time, HH:MM */
  time: string;
  /** full client name */
  name: string;
  /** service slug (e.g. "balayage") */
  service: string;
  /** unique id (Date.now() at generation time) */
  uid: string;
}

// The reference's ICS carries a FIXED 90-minute event block — the service's
// advertised duration never enters the download. Live-measured session 8:
// bookings whose advertised durations are 210 / 60 / 180 minutes all produced
// exactly 90-minute events (docs/remediation-plan-session-8.md §5.1).
const APPOINTMENT_BLOCK_MIN = 90;

// The no/partial-params fallback guards (session 17, F05c — the same regex
// semantics as the appointments route's validation). BOTH date AND time must
// be present for the chosen stamps to carry; either missing → the event
// falls back to the generation moment (live-measured: DTSTART = DTSTAMP =
// now, DTEND = now + 90 on the reference's bare /book/confirmation).
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// The reference's textual fallbacks for the missing name/service
// (live-measured session 17): SUMMARY "Maison Luminaire — Appointment",
// DESCRIPTION "Reservation for you. …".
const SERVICE_FALLBACK = "Appointment";
const NAME_FALLBACK = "you";

const pad = (n: number) => String(n).padStart(2, "0");

function nowStamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function toUtcStamp(date: string, time: string): string {
  // The reference treats the booking wall-time as UTC in the ICS payload
  // (DTSTART:20261021T113000Z for an 11:30 booking).
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00Z`;
}

function addMinutes(date: string, time: string, minutes: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const start = Date.UTC(y!, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  const end = new Date(start + minutes * 60_000);
  return (
    `${end.getUTCFullYear()}${pad(end.getUTCMonth() + 1)}${pad(end.getUTCDate())}` +
    `T${pad(end.getUTCHours())}${pad(end.getUTCMinutes())}00Z`
  );
}

function addMinutesToStamp(stamp: string, minutes: number): string {
  // stamp arithmetic on the compact UTC form ("YYYYMMDDTHHMMSSZ").
  const y = Number(stamp.slice(0, 4));
  const mo = Number(stamp.slice(4, 6)) - 1;
  const d = Number(stamp.slice(6, 8));
  const h = Number(stamp.slice(9, 11));
  const mi = Number(stamp.slice(11, 13));
  const s = Number(stamp.slice(13, 15));
  const end = new Date(Date.UTC(y, mo, d, h, mi, s) + minutes * 60_000);
  return nowStamp(end);
}

export function buildIcs(input: IcsInput): string {
  const { date, time, name, service, uid } = input;
  const dtstamp = nowStamp(new Date());
  // BOTH date AND time must be well-formed for the chosen appointment to
  // carry; either missing/malformed → the now-stamp fallback (the live's
  // dummy event — "an ICS that timestamps now", the F05 evidence).
  const hasDateTime = DATE_RE.test(date) && TIME_RE.test(time);
  const dtstart = hasDateTime ? toUtcStamp(date, time) : dtstamp;
  const dtend = hasDateTime
    ? addMinutes(date, time, APPOINTMENT_BLOCK_MIN)
    : addMinutesToStamp(dtstamp, APPOINTMENT_BLOCK_MIN);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Luminaire//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@maisonluminaire`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Maison Luminaire — ${service || SERVICE_FALLBACK}`,
    `DESCRIPTION:Reservation for ${name || NAME_FALLBACK}. We will confirm within 2 business hours.`,
    // The reference performs NO RFC 5545 comma escaping anywhere — its
    // LOCATION and comma-bearing client names pass through raw (live-measured
    // session 8). The payload is byte-parity with the reference's download,
    // which outranks RFC correctness here (documented divergence).
    "LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function icsDataUri(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
