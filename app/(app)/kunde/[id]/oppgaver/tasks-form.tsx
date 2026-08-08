"use client";

import { useActionState } from "react";
import type { Frequency } from "@/generated/prisma/enums";
import { frequencyLabels } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { completeTasks } from "@/app/actions/log-entries";
import { StickySubmit } from "@/components/mobile-form";

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
}: {
  customerId: string;
  groups: TaskGroup[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    completeTasks.bind(null, customerId),
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6 pb-4">
      {groups.map((group) => (
        <section key={group.frequency} className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-neutral-700">
            {frequencyLabels[group.frequency]}
          </h2>
          <ul className="flex flex-col gap-2">
            {group.tasks.map((task) => (
              <li key={task.id}>
                {/* Hele raden er trykkbar fordi avkryssingsboksen ligger inni label */}
                <label
                  className="flex min-h-16 cursor-pointer items-center gap-4 rounded-xl
                             border-2 border-neutral-900 bg-white px-4 py-3
                             text-neutral-950 has-checked:bg-neutral-100"
                >
                  <input
                    type="checkbox"
                    name="tasks"
                    value={task.id}
                    className="size-7 shrink-0 accent-neutral-900"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-lg font-semibold leading-tight">
                      {task.title}
                    </span>
                    <span className="text-sm text-neutral-700">
                      {task.lastDone ?? "Aldri utført"}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {state?.message && (
        <p role="alert" className="text-base font-medium text-red-800">
          {state.message}
        </p>
      )}

      <StickySubmit pending={pending}>Lagre oppgaver</StickySubmit>
    </form>
  );
}
