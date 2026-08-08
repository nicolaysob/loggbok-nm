const osloDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Kalenderdøgn i norsk tid, ikke rå 24-timersbolker. Vercel kjører i UTC, så en
// registrering kl. 23 norsk tid ville ellers blitt talt som dagen før.
function osloDayNumber(date: Date): number {
  const [year, month, day] = osloDate.format(date).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

const norwegianDate = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

export function formatDate(date: Date): string {
  return norwegianDate.format(date);
}

export function daysSince(date: Date, now: Date = new Date()): number {
  return osloDayNumber(now) - osloDayNumber(date);
}

export function formatLastVisit(
  date: Date | null,
  now: Date = new Date(),
): string {
  if (!date) return "Aldri";

  const days = daysSince(date, now);

  if (days <= 0) return "I dag";
  if (days === 1) return "I går";
  if (days < 7) return `${days} dager siden`;

  if (days < 60) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 uke siden" : `${weeks} uker siden`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 måned siden" : `${months} måneder siden`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? "1 år siden" : `${years} år siden`;
}
