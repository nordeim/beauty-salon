import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, createSessionToken, sessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in 15 minutes." },
      { status: 429 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email and password are required." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  // Always respond identically for unknown user vs wrong password (no
  // account enumeration).
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { token, maxAge } = createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } });
  res.cookies.set(sessionCookie.name, token, { ...sessionCookie.options, maxAge });
  return res;
}
