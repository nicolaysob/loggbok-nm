"use client";

import { useActionState } from "react";
import type { Frequency } from "@/generated/prisma/enums";
import { frequencyLabels } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { completeTasks } from "@/app/actions/log-entries";
import { FieldError, StickySubmit } from "@/components/mobile-form";
import { cardClass, inputClass, labelClass } from "@/lib/ui";

export type TaskOption = {
  id: string;
  title: string;
  lastDone: string | null;
};

export type TaskGroup = {
  frequency: Frequency;
  tasks: TaskOption[];
};

export function TasksForm({
  customerId,
  groups,
  defaultDateTime,
}: {
  customerId: string;
  groups: TaskGroup[];
  defaultDateTime: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    completeTasks.bind(null, customerId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="occurredAt" className={labelClass}>
          Tidspunkt
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          required
          defaultValue={defaultDateTime}
          max={defaultDateTime}
          className={`${inputClass} min-h-14`}
        />
        <p className="text-meta text-ink-2">
          Nå som standard — endre hvis oppgavene ble gjort et annet tidspunkt.
        </p>
        <FieldError messages={state?.errors?.occurredAt} />
      </div>

      {groups.map((group) => (
        <section key={group.frequency} className="flex flex-col gap-3">
          <h2 className="px-1 text-eyebrow uppercase text-ink-3">
            {frequencyLabels[group.frequency]}
          </h2>
          <ul className="flex flex-col gap-3">
            {group.tasks.map((task) => (
              <li key={task.id}>
                {/* Hele raden er trykkbar fordi avkryssingsboksen ligger inni label.
                    Avhuket rad blir grønn — grønt betyr utført. */}
                <label
                  className={`group flex min-h-[4.75rem] cursor-pointer items-center gap-4 px-4 py-3.5
                             text-ink has-checked:border-brand has-checked:bg-brand
                             has-checked:text-on-brand has-checked:shadow-brand ${cardClass}`}
                >
                  <input
                    type="checkbox"
                    name="tasks"
                    value={task.id}
                    className="size-7 shrink-0 accent-brand"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-heading">{task.title}</span>
                    <span className="text-meta tabular-nums text-ink-2 group-has-checked:text-on-brand/70">
                      {task.lastDone ?? "Aldri utført"}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <FieldError messages={state?.message ? [state.message] : undefined} />

      <StickySubmit pending={pending}>Lagre oppgaver</StickySubmit>
    </form>
  );
}
