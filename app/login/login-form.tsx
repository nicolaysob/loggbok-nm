"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

// text-body er 17px — under 16px zoomer iOS inn ved fokus.
// min-h-16 er 64px, samme trykkflate som resten av appen.
const fieldClass =
  "min-h-16 w-full rounded-2xl border border-line bg-white px-4 " +
  "text-body text-navy-900 shadow-soft outline-none " +
  "focus:border-navy-700 focus:ring-4 focus:ring-navy-900/15";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-body font-semibold text-navy-900"
        >
          Brukernavn
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-body font-semibold text-navy-900"
        >
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-body font-semibold text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-16 w-full rounded-2xl bg-brand text-heading font-semibold
                   text-white shadow-lift active:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Logger inn …" : "Logg inn"}
      </button>
    </form>
  );
}
