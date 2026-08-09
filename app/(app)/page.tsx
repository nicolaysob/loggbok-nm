import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { daysSince, formatLastVisit } from "@/lib/time";
import { cardClass } from "@/lib/ui";

function visitTone(lastVisit: Date | null): {
  label: string;
  className: string;
} {
  if (!lastVisit) {
    return {
      label: "Aldri",
      className: "bg-amber-50 text-amber-700",
    };
  }

  const days = daysSince(lastVisit);
  if (days >= 14) {
    return {
      label: formatLastVisit(lastVisit),
      className: "bg-amber-50 text-amber-700",
    };
  }
  if (days <= 0) {
    return {
      label: "I dag",
      className: "bg-green-50 text-green-700",
    };
  }

  return {
    label: formatLastVisit(lastVisit),
    className: "bg-navy-50 text-navy-700",
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
        },
      },
    },
  });

  const sorted = customers
    .map((customer) => {
      const visits = customer.areas
        .map((area) => area.logEntries[0]?.occurredAt)
        .filter((date) => date !== undefined);

      return {
        id: customer.id,
        name: customer.name,
        lastVisit:
          visits.length === 0
            ? null
            : new Date(Math.max(...visits.map((date) => date.getTime()))),
      };
    })
    // Aldri besøkt øverst, deretter eldste besøk — det mest forsømte først
    .sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) {
        return a.name.localeCompare(b.name, "nb-NO");
      }
      if (!a.lastVisit) return -1;
      if (!b.lastVisit) return 1;
      return a.lastVisit.getTime() - b.lastVisit.getTime();
    });

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

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
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-meta font-semibold tracking-wide text-navy-700 uppercase">
          I dag
        </p>
        <h1 className="text-display tracking-tight">Hei, {firstName}</h1>
        <p className="text-body text-navy-700">
          Trykk på en kunde for å loggføre. De som har ventet lengst står
          øverst.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sorted.map((customer) => {
          const tone = visitTone(customer.lastVisit);
          return (
            <li key={customer.id}>
              <Link
                href={`/kunde/${customer.id}`}
                className={`flex min-h-16 items-center gap-3 px-4 py-3.5 text-navy-900 ${cardClass}`}
              >
                <span className="min-w-0 flex-1 truncate text-heading">
                  {customer.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-mono text-meta font-semibold ${tone.className}`}
                >
                  {tone.label}
                </span>
                <span aria-hidden className="text-heading text-navy-100">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
