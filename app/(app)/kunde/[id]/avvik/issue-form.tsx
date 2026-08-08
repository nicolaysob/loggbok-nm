"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { createIssue } from "@/app/actions/issues";
import { StickySubmit, textareaClass } from "@/components/mobile-form";

export function IssueForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createIssue.bind(null, customerId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 pb-4">
      <label
        htmlFor="description"
        className="text-base font-semibold text-neutral-700"
      >
        Hva er avviket?
      </label>
      <textarea
        id="description"
        name="description"
        rows={6}
        className={textareaClass}
      />

      {state?.errors?.description?.map((error) => (
        <p
          key={error}
          role="alert"
          className="text-base font-medium text-red-800"
        >
          {error}
        </p>
      ))}
      {state?.message && (
        <p role="alert" className="text-base font-medium text-red-800">
          {state.message}
        </p>
      )}

      <StickySubmit pending={pending}>Meld avvik</StickySubmit>
    </form>
  );
}
