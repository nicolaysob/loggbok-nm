import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/dal";
import { getCustomerOverview } from "@/lib/customer-overview";
import { getOpenTimeClock } from "@/lib/time-clock-query";
import { completeCalendarJob } from "@/app/actions/jobs";
import { occursOn } from "@/lib/calendar";
import { osloMidnight, osloYmd, ymdKey } from "@/lib/period";
import { roleLabels } from "@/lib/labels";
import { actionSize, sectionHeadClass, solidActionClass } from "@/lib/ui";
import { CustomerWorkList } from "@/components/customer-work-list";
import { HomeClockBanner } from "@/components/home-clock-banner";
import { ProfileMenu } from "@/components/profile-menu";

const dayFormat = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Oslo",
});

export default async function HomePage() {
  const user = await requireStaff();
  const today = osloYmd(new Date());
  const todayKey = ymdKey(today);
  const dayStart = osloMidnight(today.year, today.month, today.day);
  const tomorrow = new Date(
    Date.UTC(today.year, today.month - 1, today.day + 1, 12),
  );
  const dayEnd = osloMidnight(
    tomorrow.getUTCFullYear(),
    tomorrow.getUTCMonth() + 1,
    tomorrow.getUTCDate(),
  );

  const [customers, openClockRow, jobs] = await Promise.all([
    getCustomerOverview(),
    getOpenTimeClock(),
    user.access.calendar
      ? db.customerJob.findMany({
          where: {
            active: true,
            area: { customer: { active: true } },
          },
          select: {
            id: true,
            kind: true,
            dueOn: true,
            weekday: true,
            startsOn: true,
            active: true,
            title: true,
            jobType: { select: { name: true } },
            area: {
              select: {
                customerId: true,
                customer: { select: { name: true } },
              },
            },
            completions: {
              where: { scheduledFor: { gte: dayStart, lt: dayEnd } },
              select: { id: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const todayJobs = jobs.filter((job) => occursOn(job, today));
  const pendingJobs = todayJobs.filter((job) => job.completions.length === 0);
  const doneJobs = todayJobs.filter((job) => job.completions.length > 0);

  const firstName = user.name.split(/\s+/)[0] ?? user.name;
  const dateLabel = dayFormat.format(new Date());

  const clockHref =
    openClockRow?.kind === "PAYROLL"
      ? "/timeliste"
      : openClockRow?.customerId
        ? `/kunde/${openClockRow.customerId}/timer`
        : null;

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-7">
      <header className="-mx-5 -mt-[max(0.75rem,env(safe-area-inset-top))] rounded-b-3xl bg-hero px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-7 text-white sm:mx-0 sm:mt-0 sm:rounded-3xl sm:pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* first-letter, ikke capitalize — «15. august», ikke «15. August» */}
            <p className="text-meta font-medium text-white/55 first-letter:uppercase">
              {dateLabel}
            </p>
            <h1 className="mt-1.5 truncate text-display">Hei, {firstName}</h1>
          </div>
          <ProfileMenu
            initial={firstName.charAt(0).toUpperCase()}
            name={user.name}
            subtitle={roleLabels[user.role]}
            links={[
              { href: "/profil", label: "Profil" },
              { href: "/support", label: "Support" },
              { href: "/personvern", label: "Personvern" },
            ]}
            inverted
          />
        </div>

        {openClockRow && clockHref ? (
          <div className="mt-5">
            <HomeClockBanner
              href={clockHref}
              startedAt={openClockRow.startedAt.toISOString()}
              label={
                openClockRow.kind === "PAYROLL"
                  ? "Stempling"
                  : (openClockRow.customer?.name ?? "Ekstraarbeid")
              }
            />
          </div>
        ) : null}
      </header>

      {todayJobs.length > 0 ? (
        <section>
          <h2 className={sectionHeadClass}>
            <span>I dag</span>
            <span>
              {doneJobs.length} av {todayJobs.length} ferdig
            </span>
          </h2>

          {pendingJobs.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {pendingJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-stretch overflow-hidden rounded-2xl border border-hair bg-surface shadow-card"
                >
                  <Link
                    href={`/kunde/${job.area.customerId}`}
                    className="flex min-h-[4.5rem] min-w-0 flex-1 items-center py-3 pl-4 active:bg-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-heading text-ink">
                        {job.area.customer.name}
                      </span>
                      <span className="mt-0.5 block truncate text-meta text-ink-2">
                        {job.title || job.jobType?.name || "Oppdrag"}
                      </span>
                    </span>
                  </Link>
                  <form
                    action={completeCalendarJob.bind(null, job.id, todayKey)}
                    className="flex shrink-0 items-center px-2.5"
                  >
                    <button
                      type="submit"
                      aria-label={`Sett ferdig hos ${job.area.customer.name}`}
                      className="flex min-h-12 items-center gap-2 rounded-xl bg-brand-soft px-3.5 text-meta font-bold text-brand transition-colors active:bg-brand active:text-on-brand"
                    >
                      <CheckIcon className="size-5" />
                      Ferdig
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-hair bg-brand-soft px-4 py-4 text-body font-semibold text-brand">
              Alt på planen er gjort i dag.
            </p>
          )}

          {doneJobs.length > 0 ? (
            <ul className="mt-2.5 overflow-hidden rounded-2xl border border-hair">
              {doneJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex min-h-12 items-center gap-2.5 border-b border-hair px-4 text-ink-3 last:border-b-0"
                >
                  <CheckIcon className="size-4 shrink-0 text-brand" />
                  <span className="min-w-0 truncate text-meta line-through">
                    {job.area.customer.name}
                    {" · "}
                    {job.title || job.jobType?.name || "Oppdrag"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {customers.length === 0 && user.role === "ADMIN" ? (
        <Link href="/kunder" className={`${actionSize} ${solidActionClass}`}>
          Legg til første kunde
        </Link>
      ) : (
        <section>
          <h2 className={sectionHeadClass}>
            <span>Kunder</span>
          </h2>
          <CustomerWorkList customers={customers} canLog={user.access.log} />
        </section>
      )}
    </div>
  );
}

function CheckIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}
