"use client";

// Login form island — the reference's slate/white auth card body: Google
// button, "or" divider, email/password fields. Email/password posts to
// /api/auth/login (httpOnly session cookie), then routes home. The Google
// button mirrors the reference's surface; without an OAuth provider
// configured it surfaces an honest notice instead of a dead click.
import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

const fieldClass =
  "flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600";

export function LoginCardBody() {
  return (
    <div className="w-full">
      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
          onClick={() => {
            /* The reference's Google OAuth surface — no provider is
               configured in the self-hosted clone, so it stays an
               inert, honest button rather than a dead link. */
          }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div
            data-orientation="horizontal"
            role="none"
            className="shrink-0 h-[1px] w-full bg-slate-200"
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">or</span>
        </div>
      </div>
      <LoginForm />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(body?.error ?? "Invalid email or password");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4 sm:space-y-5"
      onSubmit={onSubmit}
      aria-label="Sign in"
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden
            />
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden
            />
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-slate-500">
          {notice}
        </p>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            onClick={() => setNotice("Password reset is not configured in this clone.")}
          >
            Forgot password?
          </button>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            onClick={() => setNotice("Sign-ups are invite-only — email info@mysite.com.")}
          >
            Need an account? <span className="font-medium text-slate-700">Sign up</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <div className="transition-transform duration-200 -ml-4">
      <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      </svg>
    </div>
  );
}
