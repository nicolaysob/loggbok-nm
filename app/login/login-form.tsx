"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

// text-base er bevisst: under 16px zoomer iOS inn ved fokus.
// min-h-16 (64px) matcher trykkflatene på forsiden.
const fieldClass =
  "min-h-16 w-full rounded-xl border-2 border-neutral-900 bg-white px-4 text-base " +
  "text-neutral-950 outline-none focus:ring-4 focus:ring-neutral-900/30";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-base font-medium text-neutral-950">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          required
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-base font-medium text-neutral-950">
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
        <p role="alert" className="text-base font-medium text-red-800">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-16 w-full rounded-xl bg-neutral-900 px-4 text-lg font-semibold
                   text-white active:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Logger inn …" : "Logg inn"}
      </button>
    </form>
  );
}
