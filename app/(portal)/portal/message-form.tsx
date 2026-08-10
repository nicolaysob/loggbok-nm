"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomerMessage } from "@/app/actions/customer-messages";
import type { FormState } from "@/lib/validation";
import { FieldError } from "@/components/mobile-form";
import { labelClass, solidActionClass, textareaClass } from "@/lib/ui";

export function PortalMessageForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createCustomerMessage,
    undefined,
  );

  useEffect(() => {
    if (state?.message) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2.5">
      <label htmlFor="body" className={labelClass}>
        Melding til N&amp;M
      </label>
      <textarea
        id="body"
        name="body"
        rows={2}
        placeholder="Skriv hva dere trenger hjelp til …"
        className={textareaClass}
      />
      <FieldError messages={state?.errors?.body} />
      {state?.message && (
        <p
          role="status"
          className="text-body font-semibold text-green-700"
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`min-h-12 w-full rounded-md text-body font-semibold ${solidActionClass}`}
      >
        {pending ? "Sender …" : "Send melding"}
      </button>
    </form>
  );
}
