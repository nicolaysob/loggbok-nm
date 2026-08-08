"use client";

import { useActionState, useEffect, useRef } from "react";
import { frequencyOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { createTaskTemplate } from "@/app/actions/task-templates";

export function NewTaskTemplateForm({ areaId }: { areaId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    createTaskTemplate.bind(null, areaId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Tøm feltene så neste oppgave kan skrives rett inn
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <Field
          label="Tittel"
          htmlFor="new-title"
          errors={state?.errors?.title}
        >
          <input
            id="new-title"
            name="title"
            required
            className={inputClass}
          />
        </Field>
      </div>

      <div className="w-44">
        <Field
          label="Frekvens"
          htmlFor="new-frequency"
          errors={state?.errors?.frequency}
        >
          <select
            id="new-frequency"
            name="frequency"
            defaultValue="WEEKLY"
            className={inputClass}
          >
            {frequencyOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <SubmitButton pendingLabel="Legger til …">Legg til</SubmitButton>
      <Feedback message={state?.message} />
    </form>
  );
}
