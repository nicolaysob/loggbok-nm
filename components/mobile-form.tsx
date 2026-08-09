"use client";

import { cardStaticClass, solidActionClass } from "@/lib/ui";

export {
  cardClass,
  cardStaticClass,
  solidActionClass,
  outlineActionClass,
  textareaClass,
  labelClass,
  backLinkClass,
  noticeClass,
} from "@/lib/ui";

const stepButtonClass =
  "flex size-16 shrink-0 items-center justify-center rounded-2xl border " +
  "border-line bg-white text-display text-navy-900 shadow-soft " +
  "active:bg-navy-50 disabled:opacity-40";

export function FieldError({ messages }: { messages?: string[] }) {
  return (
    <>
      {messages?.map((message) => (
        <p
          key={message}
          role="alert"
          className="text-body font-semibold text-red-700"
        >
          {message}
        </p>
      ))}
    </>
  );
}

export function StickySubmit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    // Festet til bunnen så knappen alltid er innen rekkevidde for tommelen
    <div className="sticky bottom-0 -mx-4 border-t border-line bg-navy-50/95 px-4 py-3 backdrop-blur-sm">
      <button
        type="submit"
        disabled={pending}
        className={`min-h-16 w-full rounded-2xl text-heading font-semibold ${solidActionClass}`}
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
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${cardStaticClass}`}>
      <button
        type="button"
        aria-label="Færre timer"
        disabled={hours <= 0}
        onClick={() => onChange(Math.max(0, hours - step))}
        className={stepButtonClass}
      >
        −
      </button>

      <output className="font-mono text-display tabular-nums text-navy-900">
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
