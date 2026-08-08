"use client";

// Felles byggeklosser for registreringsskjemaene på mobil.
// Alle trykkflater er minst 64 px, jamfør reglene i CLAUDE.md.

export const textareaClass =
  "w-full rounded-xl border-2 border-neutral-900 bg-white px-4 py-3 " +
  "text-base text-neutral-950 outline-none focus:ring-4 focus:ring-neutral-900/30";

const stepButtonClass =
  "flex size-16 shrink-0 items-center justify-center rounded-xl border-2 " +
  "border-neutral-900 text-3xl font-semibold active:bg-neutral-100 disabled:opacity-40";

export function StickySubmit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    // Festet til bunnen så knappen alltid er innen rekkevidde for tommelen
    <div className="sticky bottom-0 -mx-4 border-t-2 border-neutral-900 bg-white px-4 py-3">
      <button
        type="submit"
        disabled={pending}
        className="min-h-16 w-full rounded-xl bg-neutral-900 px-4 text-xl font-semibold
                   text-white active:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Lagrer …" : children}
      </button>
    </div>
  );
}

export function HoursStepper({
  hours,
  onChange,
  step = 0.5,
  max = 24,
  format,
}: {
  hours: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
  format: (value: number) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Færre timer"
        disabled={hours <= 0}
        onClick={() => onChange(Math.max(0, hours - step))}
        className={stepButtonClass}
      >
        −
      </button>

      <output className="text-4xl font-bold tabular-nums text-neutral-950">
        {format(hours)}
      </output>

      <button
        type="button"
        aria-label="Flere timer"
        disabled={hours >= max}
        onClick={() => onChange(Math.min(max, hours + step))}
        className={stepButtonClass}
      >
        +
      </button>
    </div>
  );
}
