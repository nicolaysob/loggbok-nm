import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber, formatHours } from "@/lib/format";
import { formatDate } from "@/lib/time";
import {
  calendarMonth,
  currentMonth,
  parseYearMonth,
  shiftMonth,
  yearMonthParam,
} from "@/lib/period";
import { backLinkClass, cardStaticClass } from "@/lib/ui";

export default async function MonthSummaryPage({
  searchParams,
}: PageProps<"/mnd">) {
  await requireAdmin();
  const { maaned } = await searchParams;

  const parsed = parseYearMonth(
    typeof maaned === "string" ? maaned : undefined,
  );
  const period = parsed
    ? calendarMonth(parsed.year, parsed.month)
    : currentMonth();

  const previous = shiftMonth(period.year, period.month, -1);
  const next = shiftMonth(period.year, period.month, 1);
  const thisMonth = currentMonth();
  const isCurrent =
    period.year === thisMonth.year && period.month === thisMonth.month;

  const entries = await db.logEntry.findMany({
    where: {
      type: "EXTRA_WORK",
      occurredAt: { gte: period.start, lt: period.end },
    },
    orderBy: { occurredAt: "asc" },
    select: {
      id: true,
      occurredAt: true,
      hours: true,
      comment: true,
      user: { select: { name: true } },
      area: {
        select: { customerId: true, customer: { select: { name: true } } },
      },
    },
  });

  type Line = {
    id: string;
    at: Date;
    hours: number;
    comment: string | null;
    userName: string;
  };

  type Group = {
    customerId: string;
    name: string;
    hours: number;
    lines: Line[];
  };

  const byCustomer = new Map<string, Group>();

  for (const entry of entries) {
    const customerId = entry.area.customerId;
    let group = byCustomer.get(customerId);
    if (!group) {
      group = {
        customerId,
        name: entry.area.customer.name,
        hours: 0,
        lines: [],
      };
      byCustomer.set(customerId, group);
    }

    const hours = entry.hours ? decimalToNumber(entry.hours) : 0;
    group.hours += hours;
    group.lines.push({
      id: entry.id,
      at: entry.occurredAt,
      hours,
      comment: entry.comment,
      userName: entry.user.name,
    });
  }

  const groups = [...byCustomer.values()].sort((a, b) => {
    if (b.hours !== a.hours) return b.hours - a.hours;
    return a.name.localeCompare(b.name, "nb-NO");
  });

  const totalHours = groups.reduce((sum, group) => sum + group.hours, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-display tracking-tight">Fakturering</h1>
          <p className="text-body text-navy-700">
            Ekstraarbeid i {period.label.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/mnd?maaned=${yearMonthParam(previous.year, previous.month)}`}
            className={backLinkClass}
          >
            ← {previous.label}
          </Link>
          {!isCurrent && (
            <Link href="/mnd" className={backLinkClass}>
              Denne måneden
            </Link>
          )}
          <Link
            href={`/mnd?maaned=${yearMonthParam(next.year, next.month)}`}
            className={backLinkClass}
          >
            {next.label} →
          </Link>
        </div>
      </div>

      <div className={`px-4 py-4 ${cardStaticClass}`}>
        <p className="text-meta font-medium text-navy-700">
          Totalt ekstraarbeid
        </p>
        <p className="font-mono text-display tabular-nums text-navy-900">
          {formatHours(totalHours)} t
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-body text-navy-700">
          Ingen ekstraarbeid registrert i {period.label.toLowerCase()}.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {groups.map((group) => (
            <li key={group.customerId} className={`px-4 py-4 ${cardStaticClass}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/kunde/${group.customerId}`}
                  className="text-heading text-navy-900 hover:text-navy-700"
                >
                  {group.name}
                </Link>
                <span className="font-mono text-heading tabular-nums text-navy-900">
                  {formatHours(group.hours)} t
                </span>
              </div>

              <ul className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
                {group.lines.map((line) => (
                  <li key={line.id} className="flex flex-col gap-0.5">
                    <p className="font-mono text-meta font-medium text-navy-700">
                      {formatDate(line.at)} · {formatHours(line.hours)} t ·{" "}
                      {line.userName}
                    </p>
                    {line.comment && (
                      <p className="text-body text-navy-900">{line.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
