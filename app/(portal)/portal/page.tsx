import type { IssueStatus, LogType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import { issueStatusLabels, logTypeLabels } from "@/lib/labels";
import { formatDate } from "@/lib/time";
import { cardStaticClass } from "@/lib/ui";
import { PhotoThumbs } from "@/components/photo-thumbs";

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

export default async function CustomerPortalPage() {
  const user = await requireCustomer();

  const customer = await db.customer.findUnique({
    where: { id: user.customerId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return (
      <p className="text-body text-navy-700">
        Kundekontoen er ikke koblet til en kunde. Kontakt N&amp;M.
      </p>
    );
  }

  const [logEntries, issues] = await Promise.all([
    db.logEntry.findMany({
      where: { area: { customerId: customer.id } },
      orderBy: { occurredAt: "desc" },
      take: 100,
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
      where: { area: { customerId: customer.id } },
      orderBy: { createdAt: "desc" },
      take: 100,
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

  const items = [
    ...logEntries.map((entry) => ({
      key: `log-${entry.id}`,
      kind: entry.type as EntryKind,
      at: entry.occurredAt,
      userName: entry.user.name,
      text: entry.comment,
      hours: entry.hours === null ? null : decimalToNumber(entry.hours),
      tasks: entry.completedTasks.map((task) => task.taskTemplate.title),
      status: null as IssueStatus | null,
      photoUrls: entry.photos.map((photo) => photo.url),
    })),
    ...issues.map((issue) => ({
      key: `issue-${issue.id}`,
      kind: "ISSUE" as const,
      at: issue.createdAt,
      userName: issue.user.name,
      text: issue.description,
      hours: null as number | null,
      tasks: [] as string[],
      status: issue.status,
      photoUrls: issue.photos.map((photo) => photo.url),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-meta font-medium text-navy-700">Din logg</p>
        <h1 className="text-display tracking-tight text-navy-900">
          {customer.name}
        </h1>
        <p className="text-body text-navy-700">
          Her ser du besøk, oppgaver, ekstraarbeid og avvik som er registrert
          hos dere.
        </p>
      </div>

      {items.length === 0 ? (
        <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
          Ingen registreringer ennå.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
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

              {item.photoUrls.length > 0 && (
                <div className="mt-3">
                  <PhotoThumbs urls={item.photoUrls} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
