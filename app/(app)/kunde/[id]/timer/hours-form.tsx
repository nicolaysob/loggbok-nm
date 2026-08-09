"use client";

import { useActionState, useState } from "react";
import { formatHours } from "@/lib/format";
import type { FormState } from "@/lib/validation";
import { createExtraWork } from "@/app/actions/log-entries";
import {
  FieldError,
  HoursStepper,
  StickySubmit,
} from "@/components/mobile-form";
import { labelClass, noticeClass, textareaClass } from "@/lib/ui";

export function HoursForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createExtraWork.bind(null, customerId),
    undefined,
  );
  const [hours, setHours] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-8 pb-4">
      <p className={noticeClass}>
        Kun for arbeid utover kontrakten. Disse timene faktureres.
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Timer</h2>
        <HoursStepper hours={hours} onChange={setHours} format={formatHours} />
        <input type="hidden" name="hours" value={hours} />
        <FieldError messages={state?.errors?.hours} />
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor="comment" className={labelClass}>
          Hva ble gjort?
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          className={textareaClass}
        />
        <FieldError messages={state?.errors?.comment} />
      </section>

      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre ekstraarbeid</StickySubmit>
    </form>
  );
}
