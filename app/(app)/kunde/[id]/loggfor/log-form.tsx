"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { createVisitNote } from "@/app/actions/log-entries";
import { StickySubmit, textareaClass } from "@/components/mobile-form";

export function LogForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVisitNote.bind(null, customerId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 pb-4">
      <label
        htmlFor="comment"
        className="text-base font-semibold text-neutral-700"
      >
        Hva ble gjort?
      </label>
      <textarea
        id="comment"
        name="comment"
        rows={8}
        autoFocus
        className={textareaClass}
      />

      {state?.errors?.comment?.map((error) => (
        <p key={error} role="alert" className="text-base font-medium text-red-800">
          {error}
        </p>
      ))}
      {state?.message && (
        <p role="alert" className="text-base font-medium text-red-800">
          {state.message}
        </p>
      )}

      <StickySubmit pending={pending}>Lagre besøk</StickySubmit>
    </form>
  );
}
