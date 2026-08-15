import { notFound } from "next/navigation";
import type { Frequency } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { frequencyOrder } from "@/lib/labels";
import { osloDateTimeLocalKey } from "@/lib/period";
import { formatDate } from "@/lib/time";
import { BackLink } from "@/components/back-link";
import { TasksForm, type TaskGroup } from "./tasks-form";

export default async function TasksPage({
  params,
}: PageProps<"/kunde/[id]/oppgaver">) {
  await requireStaffAccess("log");
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const areaId = await primaryAreaId(customer.id);

  const templates = areaId
    ? await db.taskTemplate.findMany({
        where: { areaId },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { id: true, title: true, frequency: true },
      })
    : [];

  // Alle avhukinger nyeste først. Første treff per oppgave er den siste gangen
  // den ble utført — én spørring i stedet for én per oppgave.
  const completions = areaId
    ? await db.completedTask.findMany({
        where: { taskTemplate: { areaId } },
        orderBy: { logEntry: { occurredAt: "desc" } },
        select: {
          taskTemplateId: true,
          logEntry: {
            select: { occurredAt: true, user: { select: { name: true } } },
          },
        },
      })
    : [];

  const lastDone = new Map<string, string>();
  for (const completion of completions) {
    if (!lastDone.has(completion.taskTemplateId)) {
      lastDone.set(
        completion.taskTemplateId,
        `${formatDate(completion.logEntry.occurredAt)} · ${completion.logEntry.user.name}`,
      );
    }
  }

  const groups: TaskGroup[] = frequencyOrder
    .map((frequency: Frequency) => ({
      frequency,
      tasks: templates
        .filter((template) => template.frequency === frequency)
        .map((template) => ({
          id: template.id,
          title: template.title,
          lastDone: lastDone.get(template.id) ?? null,
        })),
    }))
    .filter((group) => group.tasks.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="-mx-2 flex items-center gap-1">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <h1 className="min-w-0 truncate text-heading">{customer.name}</h1>
      </div>

      {groups.length === 0 ? (
        <p className="border border-hair bg-surface px-5 py-5 text-body text-ink-2">
          Ingen oppgaver er satt opp for denne kunden ennå.
        </p>
      ) : (
        <TasksForm
          customerId={customer.id}
          groups={groups}
          defaultDateTime={osloDateTimeLocalKey()}
        />
      )}
    </div>
  );
}
