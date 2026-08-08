import Link from "next/link";
import { notFound } from "next/navigation";
import type { IssueStatus, LogType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import { decimalToNumber, formatHours } from "@/lib/format";
import { issueStatusLabels, logTypeLabels } from "@/lib/labels";

const RECENT_COUNT = 5;

const actionButtonClass =
  "flex min-h-20 items-center justify-center rounded-xl border-2 border-neutral-900 " +
  "px-4 text-center text-xl font-semibold";

// Avvik og ekstraarbeid skiller seg ut: det ene haster, det andre faktureres
type EntryKind = LogType | "ISSUE";

const badgeClasses: Record<EntryKind, string> = {
  VISIT_NOTE: "border-neutral-900 bg-white text-neutral-900",
  TASK_COMPLETION: "border-blue-800 bg-blue-50 text-blue-900",
  EXTRA_WORK: "border-amber-700 bg-amber-50 text-amber-900",
  ISSUE: "border-red-800 bg-red-50 text-red-900",
};

const kindLabels: Record<EntryKind, string> = {
  ...logTypeLabels,
  ISSUE: "Avvik",
};

type TimelineItem = {
  key: string;
  kind: EntryKind;
  at: Date;
  userName: string;
  text: string | null;
  hours: number | null;
  tasks: string[];
  status: IssueStatus | null;
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

  // Begge kilder hentes med samme grense. Toppen av den sammenslåtte lista må
  // ligge innenfor toppen av hver enkelt, så det er nok å hente RECENT_COUNT av hver.
  const [logEntries, issues] = await Promise.all([
    db.logEntry.findMany({
      where: { area: { customerId: id } },
      orderBy: { occurredAt: "desc" },
      take: RECENT_COUNT,
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
    }),
    db.issue.findMany({
      where: { area: { customerId: id } },
      orderBy: { createdAt: "desc" },
      take: RECENT_COUNT,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const recent: TimelineItem[] = [
    ...logEntries.map((entry) => ({
      key: `log-${entry.id}`,
      kind: entry.type as EntryKind,
      at: entry.occurredAt,
      userName: entry.user.name,
      text: entry.comment,
      hours: entry.hours === null ? null : decimalToNumber(entry.hours),
      tasks: entry.completedTasks.map((task) => task.taskTemplate.title),
      status: null,
    })),
    ...issues.map((issue) => ({
      key: `issue-${issue.id}`,
      kind: "ISSUE" as const,
      at: issue.createdAt,
      userName: issue.user.name,
      text: issue.description,
      hours: null,
      tasks: [],
      status: issue.status,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, RECENT_COUNT);

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
            {recent.map((item) => (
              <li
                key={item.key}
                className="rounded-xl border-2 border-neutral-300 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm font-semibold ${badgeClasses[item.kind]}`}
                  >
                    {kindLabels[item.kind]}
                  </span>
                  <span className="text-base font-semibold text-neutral-950">
                    {formatDate(item.at)}
                  </span>
                  {item.hours !== null && (
                    <span className="text-base font-semibold text-neutral-950">
                      {formatHours(item.hours)} t
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-700">
                  {item.userName}
                  {item.status && <> · {issueStatusLabels[item.status]}</>}
                </p>

                {item.text && (
                  <p className="mt-1 text-base text-neutral-950">{item.text}</p>
                )}

                {item.tasks.length > 0 && (
                  <p className="mt-1 text-base text-neutral-950">
                    {item.tasks.join(", ")}
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
