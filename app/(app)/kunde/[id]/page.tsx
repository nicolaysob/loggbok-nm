import Link from "next/link";
import { notFound } from "next/navigation";
import type { LogType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import { decimalToNumber, formatHours } from "@/lib/format";
import { logTypeLabels } from "@/lib/labels";

const actionButtonClass =
  "flex min-h-20 items-center justify-center rounded-xl border-2 border-neutral-900 " +
  "px-4 text-center text-xl font-semibold";

// Ekstraarbeid skiller seg ut fordi det er det eneste fakturerbare
const badgeClasses: Record<LogType, string> = {
  VISIT_NOTE: "border-neutral-900 bg-white text-neutral-900",
  TASK_COMPLETION: "border-blue-800 bg-blue-50 text-blue-900",
  EXTRA_WORK: "border-amber-700 bg-amber-50 text-amber-900",
};

export default async function CustomerPage({
  params,
  searchParams,
}: PageProps<"/kunde/[id]">) {
  await requireUser();
  const { id } = await params;
  const { lagret } = await searchParams;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const recent = await db.logEntry.findMany({
    where: { area: { customerId: id } },
    orderBy: { occurredAt: "desc" },
    take: 5,
    select: {
      id: true,
      type: true,
      occurredAt: true,
      hours: true,
      comment: true,
      user: { select: { name: true } },
      completedTasks: {
        select: { taskTemplate: { select: { title: true } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {lagret && (
        <p
          role="status"
          className="rounded-xl border-2 border-green-800 bg-green-50 px-4 py-3 text-base font-semibold text-green-900"
        >
          Registreringen er lagret.
        </p>
      )}

      <div className="flex flex-col gap-1">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center text-base underline underline-offset-2"
        >
          ← Kunder
        </Link>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={`/kunde/${customer.id}/loggfor`}
          className={`${actionButtonClass} bg-neutral-900 text-white active:bg-neutral-700`}
        >
          Loggfør besøk
        </Link>
        <Link
          href={`/kunde/${customer.id}/oppgaver`}
          className={`${actionButtonClass} bg-white text-neutral-950 active:bg-neutral-100`}
        >
          Oppgaver
        </Link>
        <Link
          href={`/kunde/${customer.id}/timer`}
          className={`${actionButtonClass} bg-white text-neutral-950 active:bg-neutral-100`}
        >
          Timeregistrering
        </Link>
        <Link
          href={`/kunde/${customer.id}/avvik`}
          className={`${actionButtonClass} bg-white text-neutral-950 active:bg-neutral-100`}
        >
          Meld avvik
        </Link>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-neutral-700">
          Siste registreringer
        </h2>

        {recent.length === 0 ? (
          <p className="text-base">Ingenting er registrert her ennå.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border-2 border-neutral-300 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm font-semibold ${badgeClasses[entry.type]}`}
                  >
                    {logTypeLabels[entry.type]}
                  </span>
                  <span className="text-base font-semibold text-neutral-950">
                    {formatDate(entry.occurredAt)}
                  </span>
                  {entry.type === "EXTRA_WORK" && entry.hours !== null && (
                    <span className="text-base font-semibold text-neutral-950">
                      {formatHours(decimalToNumber(entry.hours))} t
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-700">{entry.user.name}</p>

                {entry.comment && (
                  <p className="mt-1 text-base text-neutral-950">
                    {entry.comment}
                  </p>
                )}

                {entry.completedTasks.length > 0 && (
                  <p className="mt-1 text-base text-neutral-950">
                    {entry.completedTasks
                      .map((task) => task.taskTemplate.title)
                      .join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
