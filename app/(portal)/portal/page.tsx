import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { formatDate, formatLastVisit } from "@/lib/time";
import {
  actionSize,
  cardStaticClass,
  eyebrowClass,
  outlineActionClass,
  sectionHeadClass,
} from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { BrandIcon } from "@/components/brand";
import { PortalIssueList } from "@/components/portal-issue-list";
import { ProfileMenu } from "@/components/profile-menu";
import { PortalMessageForm } from "./message-form";

export default async function CustomerPortalPage() {
  const user = await requireCustomer();

  const customer = await db.customer.findUnique({
    where: { id: user.customerId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return (
      <p className="text-body text-ink-2">
        Kundekontoen er ikke koblet til en kunde.
      </p>
    );
  }

  const areaId = await primaryAreaId(customer.id);
  const yearStart = new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));

  const [lastVisitEntry, visitsThisYear, openIssues, openMessages, recentActivity] =
    await Promise.all([
      areaId
        ? db.logEntry.findFirst({
            where: { areaId },
            orderBy: { occurredAt: "desc" },
            select: { occurredAt: true, user: { select: { name: true } } },
          })
        : Promise.resolve(null),
      areaId
        ? db.logEntry.count({
            where: { areaId, occurredAt: { gte: yearStart } },
          })
        : Promise.resolve(0),
      db.issue.findMany({
        where: {
          area: { customerId: customer.id },
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
        where: { customerId: customer.id, readAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
        },
      }),
      getCustomerActivity(customer.id, {
        since: recentActivitySince(),
        take: RECENT_ACTIVITY_LIMIT,
      }),
    ]);

  const lastVisit = lastVisitEntry?.occurredAt ?? null;
  const openIssueCount = openIssues.length;
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex animate-rise flex-col gap-7">
      <header>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Logoen er svart — den trenger hvit bakgrunn også i mørk modus */}
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white">
              <BrandIcon size={26} className="size-6.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-meta font-bold text-ink">Loggbok</p>
              <p className="truncate text-micro text-ink-3">
                N&amp;M Vaktmesterservice
              </p>
            </div>
          </div>
          <ProfileMenu
            initial={initial}
            name={user.name}
            subtitle="Kundeportal"
            links={[
              { href: "/personvern", label: "Personvern" },
              { href: "/support", label: "Support" },
            ]}
          />
        </div>

        <h1 className="mt-6 text-display text-ink">{customer.name}</h1>

        <div className="mt-4 rounded-3xl bg-hero px-5 py-5 text-white">
          <p className="text-eyebrow uppercase text-white/50">Sist utført</p>
          <p className="mt-2.5 text-title">
            {lastVisit ? formatLastVisit(lastVisit) : "Ingen besøk ennå"}
          </p>
          {lastVisit ? (
            <p className="mt-1.5 text-meta text-white/65">
              {formatDate(lastVisit)}
              {lastVisitEntry?.user?.name
                ? ` · ${lastVisitEntry.user.name}`
                : null}
            </p>
          ) : null}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <div
            className={`rounded-2xl px-4 py-3.5 ${
              openIssueCount === 0
                ? "bg-brand-soft"
                : "border border-hair bg-surface shadow-card"
            }`}
          >
            <p
              className={
                openIssueCount === 0
                  ? "text-eyebrow uppercase text-brand"
                  : eyebrowClass
              }
            >
              Åpne avvik
            </p>
            <p
              className={`mt-2 text-title tabular-nums ${
                openIssueCount === 0 ? "text-brand" : "text-ink"
              }`}
            >
              {openIssueCount}
            </p>
          </div>
          <div className="rounded-2xl border border-hair bg-surface px-4 py-3.5 shadow-card">
            <p className={eyebrowClass}>Besøk i år</p>
            <p className="mt-2 text-title tabular-nums text-ink">
              {visitsThisYear}
            </p>
          </div>
        </div>
      </header>

      {openIssueCount > 0 ? (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Åpne avvik</span>
            <Link
              href="/portal/avvik"
              className="text-eyebrow uppercase text-ink-2"
            >
              Alle ›
            </Link>
          </h2>
          <PortalIssueList
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
      ) : null}

      <section>
        <h2 className={sectionHeadClass}>
          <span>Meld fra til oss</span>
          <Link
            href="/portal/meldinger"
            className="text-eyebrow uppercase text-ink-2"
          >
            Tidligere ›
          </Link>
        </h2>
        <PortalMessageForm />

        {openMessages.length > 0 ? (
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {openMessages.map((message) => (
              <li
                key={message.id}
                className={`flex flex-col gap-1.5 px-4 py-3.5 ${cardStaticClass}`}
              >
                <span className="text-micro text-ink-3">
                  Sendt {formatDate(message.createdAt)} · ikke lest ennå
                </span>
                <p className="text-body whitespace-pre-wrap text-ink">
                  {message.body}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h2 className={sectionHeadClass}>
          <span>Utført arbeid</span>
          <Link
            href="/portal/aktivitet"
            className="text-eyebrow uppercase text-ink-2"
          >
            Arkiv ›
          </Link>
        </h2>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer ennå."
        />

        <Link
          href="/portal/rapport"
          className={`mt-4 ${actionSize} ${outlineActionClass}`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </svg>
          Månedsrapport
        </Link>
      </section>
    </div>
  );
}
