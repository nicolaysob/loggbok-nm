"use client";

import { useActionState } from "react";
import type { Frequency } from "@/generated/prisma/enums";
import { frequencyOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Field, SubmitButton, inputClass } from "@/components/form";
import {
  deleteTaskTemplate,
  moveTaskTemplate,
  updateTaskTemplate,
} from "@/app/actions/task-templates";

export type TaskTemplateRowData = {
  id: string;
  title: string;
  frequency: Frequency;
};

const iconButtonClass =
  "rounded border border-black/25 px-2 py-2 text-sm hover:bg-black/5 disabled:opacity-40";

export function TaskTemplateRow({
  template,
  isFirst,
  isLast,
}: {
  template: TaskTemplateRowData;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateTaskTemplate.bind(null, template.id),
    undefined,
  );

  return (
    // Flytteknappene ligger til venstre og Slett helt til høyre, med skillelinje.
    // Slett skal ikke kunne treffes med et bomklikk ment for Lagre.
    // Skjemaene er søsken, ikke nøstet — nøstede form-elementer er ugyldig HTML.
    <li className="flex items-end gap-2 border-b border-black/10 py-3">
      <div className="flex gap-1 pb-1">
        <form action={moveTaskTemplate.bind(null, template.id, "up")}>
          <button
            type="submit"
            disabled={isFirst}
            aria-label="Flytt opp"
            className={iconButtonClass}
          >
            ↑
          </button>
        </form>

        <form action={moveTaskTemplate.bind(null, template.id, "down")}>
          <button
            type="submit"
            disabled={isLast}
            aria-label="Flytt ned"
            className={iconButtonClass}
          >
            ↓
          </button>
        </form>
      </div>

      <form action={formAction} className="flex flex-1 items-end gap-2">
        <div className="flex-1">
          <Field
            label="Tittel"
            htmlFor={`title-${template.id}`}
            errors={state?.errors?.title}
          >
            <input
              id={`title-${template.id}`}
              name="title"
              defaultValue={template.title}
              required
              className={inputClass}
            />
          </Field>
        </div>

        <div className="w-44">
          <Field
            label="Frekvens"
            htmlFor={`frequency-${template.id}`}
            errors={state?.errors?.frequency}
          >
            <select
              id={`frequency-${template.id}`}
              name="frequency"
              defaultValue={template.frequency}
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

        <SubmitButton pendingLabel="…">Lagre</SubmitButton>
      </form>

      <form
        action={deleteTaskTemplate.bind(null, template.id)}
        onSubmit={(event) => {
          if (!window.confirm(`Slette oppgaven «${template.title}»?`)) {
            event.preventDefault();
          }
        }}
        className="ml-8 border-l border-black/10 pl-6"
      >
        <button
          type="submit"
          className="rounded border border-red-700/40 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          Slett
        </button>
      </form>
    </li>
  );
}
