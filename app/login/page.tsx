import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logg inn – Loggbok",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden px-6 py-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgb(21_128_61/0.16),_transparent_60%)]"
      />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center animate-rise">
        <header className="mb-8 flex flex-col items-center text-center">
          <BrandLogo priority className="mx-auto w-[13.5rem] sm:w-[15rem]" />
          <div className="mt-6 flex flex-col gap-1.5">
            <p className="text-meta font-semibold tracking-[0.14em] text-brand uppercase">
              Loggbok
            </p>
            <h1 className="sr-only">Logg inn</h1>
            <p className="text-body text-navy-700">
              Intern registrering for N&amp;M Vaktmesterservice
            </p>
          </div>
        </header>

        <div className="rounded-3xl border border-line bg-white/95 p-5 shadow-card sm:p-6">
          <p className="mb-5 text-heading text-navy-900">Logg inn</p>
          <LoginForm />
        </div>
      </div>

      <footer className="relative mx-auto mt-10 w-full max-w-sm text-center">
        <p className="text-meta font-medium text-navy-700">
          N&amp;M Vaktmesterservice AS
        </p>
      </footer>
    </main>
  );
}
