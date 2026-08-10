import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import {
  getCustomerActivity,
  recentActivitySince,
  RECENT_ACTIVITY_LIMIT,
} from "@/lib/customer-activity";
import { formatDate } from "@/lib/time";
import { outlineActionClass } from "@/lib/ui";
import { ActivityList } from "@/components/activity-list";
import { PortalMessageForm } from "./message-form";

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

  const [openMessages, recentActivity] = await Promise.all([
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
        {openMessages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-meta font-semibold text-navy-900">
              Venter på oppfølging
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {openMessages.map((message) => (
                <li key={message.id} className="flex flex-col gap-1 py-3">
                  <span className="font-mono text-meta font-medium text-navy-700">
                    {formatDate(message.createdAt)}
                  </span>
                  <p className="text-body whitespace-pre-wrap text-navy-900">
                    {message.body}
                  </p>
                  <p className="text-meta font-medium text-navy-700">
                    Mottatt — venter på oppfølging
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-heading text-navy-900">Siste aktivitet</h2>
        <p className="text-meta text-navy-700">Siste 14 dager</p>
        <ActivityList
          items={recentActivity}
          emptyText="Ingen registreringer de siste 14 dagene."
        />
        <div className="flex flex-col gap-3">
          <Link
            href="/portal/aktivitet"
            className={`flex min-h-14 items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
          >
            Aktivitetsarkiv
            <span
              aria-hidden
              className="text-display leading-none text-navy-100"
            >
              ›
            </span>
          </Link>
          <Link
            href="/portal/meldinger"
            className={`flex min-h-14 items-center justify-between rounded-md px-4 text-body font-semibold ${outlineActionClass}`}
          >
            Meldingsarkiv
            <span
              aria-hidden
              className="text-display leading-none text-navy-100"
            >
              ›
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
