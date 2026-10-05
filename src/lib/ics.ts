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

const pad = (n: number) => String(n).padStart(2, "0");

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

export function buildIcs(input: IcsInput): string {
  const { date, time, name, service, uid } = input;
  const dtstart = toUtcStamp(date, time);
  const dtend = addMinutes(date, time, APPOINTMENT_BLOCK_MIN);
  const dtstamp = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Luminaire//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@maisonluminaire`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Maison Luminaire — ${service}`,
    `DESCRIPTION:Reservation for ${name}. We will confirm within 2 business hours.`,
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
