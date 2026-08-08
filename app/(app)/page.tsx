import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatLastVisit } from "@/lib/time";

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

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Kunder</h1>
        <p className="text-base">Ingen aktive kunder er lagt inn ennå.</p>
        {user.role === "ADMIN" && (
          <Link
            href="/kunder"
            className="text-base underline underline-offset-2"
          >
            Gå til kundeadministrasjon
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Kunder</h1>

      <ul className="flex flex-col gap-3">
        {sorted.map((customer) => (
          <li key={customer.id}>
            <Link
              href={`/kunde/${customer.id}`}
              className="flex min-h-16 items-center justify-between gap-3 rounded-xl
                         border-2 border-neutral-900 bg-white px-4 py-3
                         text-neutral-950 active:bg-neutral-100"
            >
              <span className="truncate text-lg font-semibold leading-tight">
                {customer.name}
              </span>
              <span className="shrink-0 text-base font-medium">
                {formatLastVisit(customer.lastVisit)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
