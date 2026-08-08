"use client";

import { useActionState, useState } from "react";
import { formatHours } from "@/lib/format";
import type { FormState } from "@/lib/validation";
import { createExtraWork } from "@/app/actions/log-entries";
import {
  HoursStepper,
  StickySubmit,
  textareaClass,
} from "@/components/mobile-form";

function Errors({ messages }: { messages?: string[] }) {
  return (
    <>
      {messages?.map((message) => (
        <p
          key={message}
          role="alert"
          className="text-base font-medium text-red-800"
        >
          {message}
        </p>
      ))}
    </>
  );
}

export function HoursForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createExtraWork.bind(null, customerId),
    undefined,
  );
  const [hours, setHours] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-4">
      <p className="rounded-xl border-2 border-amber-700 bg-amber-50 px-4 py-3 text-base text-amber-900">
        Kun for arbeid utover kontrakten. Disse timene faktureres.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-neutral-700">Timer</h2>
        <HoursStepper hours={hours} onChange={setHours} format={formatHours} />
        <input type="hidden" name="hours" value={hours} />
        <Errors messages={state?.errors?.hours} />
      </section>

      <section className="flex flex-col gap-2">
        <label
          htmlFor="comment"
          className="text-base font-semibold text-neutral-700"
        >
          Hva ble gjort?
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          className={textareaClass}
        />
        <Errors messages={state?.errors?.comment} />
      </section>

      {state?.message && (
        <p role="alert" className="text-base font-medium text-red-800">
          {state.message}
        </p>
      )}

      <StickySubmit pending={pending}>Lagre ekstraarbeid</StickySubmit>
    </form>
  );
}
