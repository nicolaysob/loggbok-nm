import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import {
  backLinkClass,
  cardStaticClass,
  outlineActionClass,
  solidActionClass,
} from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { IssueList } from "./avvik/issue-list";
import { SignMessageButton } from "./sign-message-button";

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
  {
    href: "meldingsarkiv",
    title: "Meldingsarkiv",
    hint: "Signerte meldinger fra kunden",
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

  const [openIssues, openMessages, recentActivity] = await Promise.all([
    db.issue.findMany({
      where: {
        area: { customerId: id },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
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
      where: { customerId: id, readAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    getCustomerActivity(id, {
      since: recentActivitySince(),
      take: RECENT_ACTIVITY_LIMIT,
    }),
  ]);

  return (
    <div className="flex animate-rise flex-col gap-8">
      {lagret && (
        <p
          role="status"
          className="rounded-md border border-green-700/20 bg-green-50 px-4 py-3 text-body font-semibold text-green-700"
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
            className={`flex min-h-20 items-center justify-between gap-3 rounded-md px-5 py-4 ${
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

      {openMessages.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-heading text-navy-900">
            {openMessages.length === 1
              ? "Ny melding fra kunden"
              : `${openMessages.length} nye meldinger fra kunden`}
          </h2>
          <ul className="flex flex-col gap-3">
            {openMessages.map((message) => (
              <li
                key={message.id}
                className={`border-navy-100 bg-navy-50 px-4 py-3.5 ${cardStaticClass}`}
              >
                <p className="text-meta font-medium text-navy-700">
                  <span className="font-mono">
                    {formatDate(message.createdAt)}
                  </span>
                  {" · "}
                  {message.user.name}
                </p>
                <p className="mt-1.5 text-body whitespace-pre-wrap text-navy-900">
                  {message.body}
                </p>
                <SignMessageButton messageId={message.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {openIssues.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-heading text-red-700">Åpne avvik</h2>
            <Link
              href={`/kunde/${customer.id}/avvik`}
              className="text-meta font-semibold text-red-700 underline"
            >
              Se alle
            </Link>
          </div>
          <IssueList
            issues={openIssues.map((issue) => ({
              id: issue.id,
              description: issue.description,
              status: issue.status,
              created: formatDate(issue.createdAt),
              reportedBy: issue.user.name,
              photoUrls: issue.photos.map((photo) => photo.url),
            }))}
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-heading">Siste aktivitet</h2>
        <p className="text-meta text-navy-700">Siste 14 dager</p>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer de siste 14 dagene."
        />
        <Link
          href={`/kunde/${customer.id}/aktivitet`}
          className={`flex min-h-14 items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
        >
          Aktivitetsarkiv
          <span aria-hidden className="text-display leading-none text-navy-100">
            ›
          </span>
        </Link>
      </section>
    </div>
  );
}
