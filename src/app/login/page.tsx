import type { Metadata } from "next";
import Image from "next/image";
import { LoginCardBody } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue to Beauty Salon.",
};

// The auth surface keeps the reference's distinct slate/white visual language
// (separate from the marketing site's cream editorial system). The wash uses
// the arbitrary sRGB gradient form (trap-3 precedent): v4's bg-gradient-to-*
// interpolates in oklab and Chrome reports lab() stops; the arbitrary form
// keeps the computed colors identical to the reference's from-slate-50
// to-slate-100 ramp.
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[linear-gradient(to_bottom_right,#f8fafc,#f1f5f9)] p-4">
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
                  <Image
                    className="aspect-square h-full w-full object-cover"
                    alt="Beauty Salon logo"
                    src="/images/logo.png"
                    width={96}
                    height={96}
                    priority
                  />
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome to Beauty Salon
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium">
                  Sign in to continue
                </p>
              </div>
              <div className="w-full">
                <LoginCardBody />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>
      </div>
    </main>
  );
}
