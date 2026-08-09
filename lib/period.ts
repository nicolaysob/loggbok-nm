// Periodegrenser i norsk tid (Europe/Oslo). Vercel kjører i UTC.

const osloDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type Ymd = { year: number; month: number; day: number };

export type PeriodRange = {
  start: Date;
  end: Date;
  label: string;
};

export function osloYmd(date: Date): Ymd {
  const [year, month, day] = osloDate.format(date).split("-").map(Number);
  return { year, month, day };
}

function addDays(ymd: Ymd, delta: number): Ymd {
  const utc = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + delta, 12));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

// UTC-instant nærmest midnatt i Europe/Oslo på gitt kalenderdag.
export function osloMidnight(year: number, month: number, day: number): Date {
  const candidate = Date.UTC(year, month - 1, day, 0);

  for (let step = -14; step <= 14; step++) {
    const probe = new Date(candidate + step * 3_600_000);
    const local = osloYmd(probe);
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Oslo",
        hour: "numeric",
        hourCycle: "h23",
      }).format(probe),
    );

    if (
      local.year === year &&
      local.month === month &&
      local.day === day &&
      hour === 0
    ) {
      return new Date(
        Date.UTC(
          probe.getUTCFullYear(),
          probe.getUTCMonth(),
          probe.getUTCDate(),
          probe.getUTCHours(),
          0,
          0,
          0,
        ),
      );
    }
  }

  return new Date(candidate);
}

export function currentWeek(now: Date = new Date()): PeriodRange {
  const today = osloYmd(now);
  const utcNoon = Date.UTC(today.year, today.month - 1, today.day, 12);
  const sundayBased = new Date(utcNoon).getUTCDay();
  const fromMonday = sundayBased === 0 ? 6 : sundayBased - 1;

  const monday = addDays(today, -fromMonday);
  const sunday = addDays(monday, 6);
  const nextMonday = addDays(monday, 7);

  const dayFormat = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return {
    start: osloMidnight(monday.year, monday.month, monday.day),
    end: osloMidnight(nextMonday.year, nextMonday.month, nextMonday.day),
    label: `${dayFormat.format(new Date(Date.UTC(monday.year, monday.month - 1, monday.day)))}–${dayFormat.format(new Date(Date.UTC(sunday.year, sunday.month - 1, sunday.day)))}`,
  };
}

export function calendarMonth(
  year: number,
  month: number,
): PeriodRange & { year: number; month: number } {
  const next =
    month === 12
      ? { year: year + 1, month: 1 }
      : { year, month: month + 1 };

  const label = new Intl.DateTimeFormat("nb-NO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return {
    year,
    month,
    start: osloMidnight(year, month, 1),
    end: osloMidnight(next.year, next.month, 1),
    // «august 2026» → «August 2026»
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

export function currentMonth(now: Date = new Date()) {
  const { year, month } = osloYmd(now);
  return calendarMonth(year, month);
}

export function shiftMonth(year: number, month: number, delta: number) {
  const utc = new Date(Date.UTC(year, month - 1 + delta, 1));
  return calendarMonth(utc.getUTCFullYear(), utc.getUTCMonth() + 1);
}

// Godtar «2026-08». Ugyldig verdi → null.
export function parseYearMonth(value: string | undefined): {
  year: number;
  month: number;
} | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month };
}

export function yearMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function ymdKey(ymd: Ymd): string {
  return `${ymd.year}-${String(ymd.month).padStart(2, "0")}-${String(ymd.day).padStart(2, "0")}`;
}

export function parseYmdKey(value: string): Ymd | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function addCalendarDays(ymd: Ymd, delta: number): Ymd {
  return addDays(ymd, delta);
}

export function weekFromMonday(monday: Ymd): PeriodRange & { monday: Ymd } {
  const sunday = addDays(monday, 6);
  const nextMonday = addDays(monday, 7);
  const dayFormat = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return {
    monday,
    start: osloMidnight(monday.year, monday.month, monday.day),
    end: osloMidnight(nextMonday.year, nextMonday.month, nextMonday.day),
    label: `${dayFormat.format(new Date(Date.UTC(monday.year, monday.month - 1, monday.day)))}–${dayFormat.format(new Date(Date.UTC(sunday.year, sunday.month - 1, sunday.day)))}`,
  };
}

export function shiftWeek(monday: Ymd, deltaWeeks: number) {
  return weekFromMonday(addDays(monday, deltaWeeks * 7));
}

export function mondayOf(now: Date = new Date()): Ymd {
  const today = osloYmd(now);
  const utcNoon = Date.UTC(today.year, today.month - 1, today.day, 12);
  const sundayBased = new Date(utcNoon).getUTCDay();
  const fromMonday = sundayBased === 0 ? 6 : sundayBased - 1;
  return addDays(today, -fromMonday);
}

// Godtar «2026-08-03» som mandag. Ugyldig → null.
export function parseWeekParam(value: string | undefined): Ymd | null {
  const ymd = value ? parseYmdKey(value) : null;
  if (!ymd) return null;
  const utcNoon = Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12);
  const sundayBased = new Date(utcNoon).getUTCDay();
  // Må være en mandag
  if (sundayBased !== 1) return null;
  return ymd;
}

export function weekParam(monday: Ymd): string {
  return ymdKey(monday);
}

export function daysOfWeek(monday: Ymd): Ymd[] {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

// 0 = mandag … 6 = søndag for en Oslo-kalenderdag
export function weekdayIndex(ymd: Ymd): number {
  const utcNoon = Date.UTC(ymd.year, ymd.month - 1, ymd.day, 12);
  const sundayBased = new Date(utcNoon).getUTCDay();
  return sundayBased === 0 ? 6 : sundayBased - 1;
}

export function daysBetween(a: Ymd, b: Ymd): number {
  return (
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) /
    86_400_000
  );
}
