import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { daysSince, formatLastVisit } from "@/lib/time";

function visitTone(lastVisit: Date | null): {
  label: string;
  className: string;
} {
  if (!lastVisit) {
    return {
      label: "Aldri",
      className: "text-amber-700",
    };
  }

  const days = daysSince(lastVisit);
  if (days >= 14) {
    return {
      label: formatLastVisit(lastVisit),
      className: "text-amber-700",
    };
  }
  if (days <= 0) {
    return {
      label: "I dag",
      className: "text-green-700",
    };
  }

  return {
    label: formatLastVisit(lastVisit),
    className: "text-navy-700",
  };
}

export default async function HomePage() {
  const user = await requireUser();

  const customers = await db.customer.findMany({
    // Inaktive kunder er arkivert og hører ikke hjemme i dagslista
    where: { active: true },
    select: {
      id: true,
      name: true,
      areas: {
        select: {
          logEntries: {
            orderBy: { occurredAt: "desc" },
            take: 1,
            select: { occurredAt: true },
          },
          _count: {
            select: {
              issues: {
                where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
              },
            },
          },
        },
      },
      _count: {
        select: {
          messages: { where: { readAt: null } },
        },
      },
    },
  });

  const sorted = customers
    .map((customer) => {
      const visits = customer.areas
        .map((area) => area.logEntries[0]?.occurredAt)
        .filter((date) => date !== undefined);

      const openIssues = customer.areas.reduce(
        (sum, area) => sum + area._count.issues,
        0,
      );

      return {
        id: customer.id,
        name: customer.name,
        openIssues,
        unreadMessages: customer._count.messages,
        lastVisit:
          visits.length === 0
            ? null
            : new Date(Math.max(...visits.map((date) => date.getTime()))),
      };
    })
    // Avvik øverst, deretter uleste meldinger, deretter eldste besøk
    .sort((a, b) => {
      if (a.openIssues > 0 !== b.openIssues > 0) {
        return a.openIssues > 0 ? -1 : 1;
      }
      if (b.openIssues !== a.openIssues) {
        return b.openIssues - a.openIssues;
      }
      if (a.unreadMessages > 0 !== b.unreadMessages > 0) {
        return a.unreadMessages > 0 ? -1 : 1;
      }
      if (b.unreadMessages !== a.unreadMessages) {
        return b.unreadMessages - a.unreadMessages;
      }
      if (!a.lastVisit && !b.lastVisit) {
        return a.name.localeCompare(b.name, "nb-NO");
      }
      if (!a.lastVisit) return -1;
      if (!b.lastVisit) return 1;
      return a.lastVisit.getTime() - b.lastVisit.getTime();
    });

  const firstName = user.name.split(/\s+/)[0] ?? user.name;
  const totalOpen = sorted.reduce((sum, row) => sum + row.openIssues, 0);
  const totalUnread = sorted.reduce((sum, row) => sum + row.unreadMessages, 0);

  if (sorted.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-4">
        <h1 className="text-display tracking-tight">Hei, {firstName}</h1>
        <p className="text-body text-navy-700">
          Ingen aktive kunder er lagt inn ennå.
        </p>
        {user.role === "ADMIN" && (
          <Link
            href="/kunder"
            className="text-body font-medium text-navy-700 hover:text-navy-900"
          >
            Gå til kundeadministrasjon
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-navy-900">
          Hei, {firstName}
        </h1>
        <p className="text-body text-navy-700">
          Trykk på en kunde for å loggføre.
          {totalOpen > 0
            ? ` ${totalOpen} åpne avvik står øverst.`
            : totalUnread > 0
              ? ` ${totalUnread === 1 ? "1 ulest melding" : `${totalUnread} uleste meldinger`} står øverst.`
              : " De som har ventet lengst står øverst."}
        </p>
      </div>

      <ul className="divide-y divide-line border-y border-line bg-white">
        {sorted.map((customer) => {
          const tone = visitTone(customer.lastVisit);
          return (
            <li key={customer.id}>
              <Link
                href={`/kunde/${customer.id}`}
                className={`flex min-h-16 items-center gap-3 px-1 py-3.5 text-navy-900 transition-colors active:bg-navy-50 sm:px-2 ${
                  customer.openIssues > 0
                    ? "bg-red-50/40"
                    : customer.unreadMessages > 0
                      ? "bg-navy-50/70"
                      : ""
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-heading">
                  {customer.name}
                </span>
                {customer.openIssues > 0 && (
                  <span className="shrink-0 text-meta font-semibold text-red-700">
                    {customer.openIssues === 1
                      ? "1 avvik"
                      : `${customer.openIssues} avvik`}
                  </span>
                )}
                {customer.unreadMessages > 0 && (
                  <span className="shrink-0 text-meta font-semibold text-navy-900">
                    {customer.unreadMessages === 1
                      ? "1 melding"
                      : `${customer.unreadMessages} meldinger`}
                  </span>
                )}
                <span
                  className={`shrink-0 font-mono text-meta font-medium ${tone.className}`}
                >
                  {tone.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
