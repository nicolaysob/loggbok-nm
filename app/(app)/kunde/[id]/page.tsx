import Link from "next/link";
import { notFound } from "next/navigation";
import type { IssueStatus, LogType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import { decimalToNumber, formatHours } from "@/lib/format";
import { issueStatusLabels, logTypeLabels } from "@/lib/labels";
import {
  backLinkClass,
  cardStaticClass,
  outlineActionClass,
  solidActionClass,
} from "@/lib/ui";
import { PhotoThumbs } from "@/components/photo-thumbs";

const RECENT_COUNT = 5;

type EntryKind = LogType | "ISSUE";

const badgeClasses: Record<EntryKind, string> = {
  VISIT_NOTE: "bg-navy-100 text-navy-900",
  TASK_COMPLETION: "bg-green-50 text-green-700",
  EXTRA_WORK: "bg-navy-50 text-navy-900",
  ISSUE: "bg-red-50 text-red-700",
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
  photoUrls: string[];
};

const actions = [
  {
    href: "loggfor",
    title: "Loggfør besøk",
    hint: "Notat fra runden",
    primary: true,
  },
  {
    href: "oppgaver",
    title: "Oppgaver",
    hint: "Kryss av faste jobber",
    primary: false,
  },
  {
    href: "timer",
    title: "Timeregistrering",
    hint: "Ekstraarbeid til faktura",
    primary: false,
  },
  {
    href: "avvik",
    title: "Meld avvik",
    hint: "Feil og mangler",
    primary: false,
  },
] as const;

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
        photos: { select: { url: true }, take: 3 },
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
        photos: { select: { url: true }, take: 3 },
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
      photoUrls: entry.photos.map((photo) => photo.url),
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
      photoUrls: issue.photos.map((photo) => photo.url),
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, RECENT_COUNT);

  return (
    <div className="flex animate-rise flex-col gap-8">
      {lagret && (
        <p
          role="status"
          className="rounded-2xl border border-green-700/20 bg-green-50 px-4 py-3 text-body font-semibold text-green-700"
        >
          Registreringen er lagret.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Link href="/" className={backLinkClass}>
          ← Kunder
        </Link>
        <h1 className="text-display tracking-tight">{customer.name}</h1>
        <p className="text-body text-navy-700">Hva skal registreres?</p>
      </div>

      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={`/kunde/${customer.id}/${action.href}`}
            className={`flex min-h-20 items-center justify-between gap-3 rounded-2xl px-5 py-4 ${
              action.primary ? solidActionClass : outlineActionClass
            }`}
          >
            <span className="flex flex-col gap-0.5 text-left">
              <span className="text-heading font-semibold">{action.title}</span>
              <span
                className={`text-meta font-medium ${
                  action.primary ? "text-white/75" : "text-navy-700"
                }`}
              >
                {action.hint}
              </span>
            </span>
            <span
              aria-hidden
              className={`text-display leading-none ${
                action.primary ? "text-white/50" : "text-navy-100"
              }`}
            >
              ›
            </span>
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Siste registreringer</h2>

        {recent.length === 0 ? (
          <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
            Ingenting er registrert her ennå.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((item) => (
              <li key={item.key} className={`px-4 py-3.5 ${cardStaticClass}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-meta font-semibold ${badgeClasses[item.kind]}`}
                  >
                    {kindLabels[item.kind]}
                  </span>
                  <span className="font-mono text-meta font-medium text-navy-700">
                    {formatDate(item.at)}
                  </span>
                  {item.hours !== null && (
                    <span className="font-mono text-meta font-semibold text-navy-900">
                      {formatHours(item.hours)} t
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-meta font-medium text-navy-700">
                  {item.userName}
                  {item.status && <> · {issueStatusLabels[item.status]}</>}
                </p>

                {item.text && (
                  <p className="mt-2 text-body whitespace-pre-wrap text-navy-900">
                    {item.text}
                  </p>
                )}

                {item.tasks.length > 0 && (
                  <p className="mt-2 text-body text-navy-900">
                    {item.tasks.join(", ")}
                  </p>
                )}

                <PhotoThumbs urls={item.photoUrls} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
