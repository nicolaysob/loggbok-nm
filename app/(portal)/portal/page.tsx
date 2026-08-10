import type { IssueStatus, LogType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import { issueStatusLabels, logTypeLabels } from "@/lib/labels";
import { formatDate } from "@/lib/time";
import { PhotoThumbs } from "@/components/photo-thumbs";
import { PortalMessageForm } from "./message-form";

type EntryKind = LogType | "ISSUE";

const kindLabels: Record<EntryKind, string> = {
  ...logTypeLabels,
  ISSUE: "Avvik",
};

const kindTone: Record<EntryKind, string> = {
  VISIT_NOTE: "text-navy-900",
  TASK_COMPLETION: "text-green-700",
  EXTRA_WORK: "text-navy-900",
  ISSUE: "text-red-700",
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

  const [logEntries, issues, messages] = await Promise.all([
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
    db.customerMessage.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        body: true,
        createdAt: true,
        readAt: true,
        signedBy: { select: { name: true } },
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
    <div className="flex animate-rise flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-navy-900">
          {customer.name}
        </h1>
        <p className="text-body text-navy-700">Besøk og meldinger hos dere.</p>
      </div>

      <section className="flex flex-col gap-4">
        <PortalMessageForm />
        {messages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-meta font-semibold text-navy-900">
              Dine meldinger
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {messages.map((message) => (
                <li key={message.id} className="flex flex-col gap-1 py-3">
                  <span className="font-mono text-meta font-medium text-navy-700">
                    {formatDate(message.createdAt)}
                  </span>
                  <p className="text-body whitespace-pre-wrap text-navy-900">
                    {message.body}
                  </p>
                  {message.readAt && message.signedBy ? (
                    <p className="text-meta font-medium text-green-700">
                      Signert av {message.signedBy.name} ·{" "}
                      {formatDate(message.readAt)}
                    </p>
                  ) : (
                    <p className="text-meta font-medium text-navy-700">
                      Mottatt — venter på oppfølging
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-navy-900">Siste aktivitet</h2>

        {items.length === 0 ? (
          <p className="border-y border-line py-5 text-body text-navy-700">
            Ingen registreringer ennå.
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.key} className="flex flex-col gap-1.5 py-3.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    className={`text-meta font-semibold ${kindTone[item.kind]}`}
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

                <p className="text-meta font-medium text-navy-700">
                  {item.userName}
                  {item.status && <> · {issueStatusLabels[item.status]}</>}
                </p>

                {item.text && (
                  <p className="text-body whitespace-pre-wrap text-navy-900">
                    {item.text}
                  </p>
                )}

                {item.tasks.length > 0 && (
                  <p className="text-body text-navy-900">
                    {item.tasks.join(", ")}
                  </p>
                )}

                {item.photoUrls.length > 0 && (
                  <div className="pt-1">
                    <PhotoThumbs urls={item.photoUrls} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
