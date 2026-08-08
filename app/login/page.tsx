import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logg inn – Loggbok",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-8 text-3xl font-bold text-neutral-950">Loggbok</h1>
        <LoginForm />
      </div>
    </main>
  );
}
