"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";

export type AreaFormValues = {
  name: string;
  address: string;
  notes: string;
};

export const emptyArea: AreaFormValues = { name: "", address: "", notes: "" };

export function AreaForm({
  action,
  values,
  submitLabel,
  resetOnSuccess = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: AreaFormValues;
  submitLabel: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Når skjemaet brukes til å legge til flere områder etter hverandre,
  // skal feltene tømmes så neste kan skrives rett inn
  useEffect(() => {
    if (resetOnSuccess && state?.message) formRef.current?.reset();
  }, [resetOnSuccess, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex max-w-2xl flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Navn" htmlFor="area-name" errors={state?.errors?.name}>
          <input
            id="area-name"
            name="name"
            defaultValue={values.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Adresse"
          htmlFor="area-address"
          errors={state?.errors?.address}
        >
          <input
            id="area-address"
            name="address"
            defaultValue={values.address}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notater" htmlFor="area-notes" errors={state?.errors?.notes}>
        <textarea
          id="area-notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-4">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
