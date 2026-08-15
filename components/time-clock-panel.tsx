"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cancelTimeClock,
  startExtraWorkClock,
  startPayrollClock,
  stopTimeClock,
} from "@/app/actions/time-clock";
import { CommentField } from "@/components/comment-field";
import { FieldError } from "@/components/mobile-form";
import { formatHours } from "@/lib/format";
import { hoursFromClock } from "@/lib/time-clock";
import type { FormState } from "@/lib/validation";

export type OpenClockProp = {
  kind: "PAYROLL" | "EXTRA_WORK";
  customerId: string | null;
  customerName: string | null;
  startedAt: string;
} | null;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatDigitalElapsed(startedAt: Date, now: Date): string {
  const totalSeconds = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function isActiveHere(
  openClock: OpenClockProp,
  mode: "PAYROLL" | "EXTRA_WORK",
  customerId?: string,
): boolean {
  if (!openClock) return false;
  if (mode === "PAYROLL") return openClock.kind === "PAYROLL";
  return (
    openClock.kind === "EXTRA_WORK" && openClock.customerId === customerId
  );
}

const clockFaceClass =
  "font-mono text-[3.5rem] leading-none tracking-tight tabular-nums sm:text-6xl";

const fullActionClass =
  "flex min-h-16 w-full items-center justify-center gap-2.5 rounded-2xl " +
  "text-body font-bold transition-colors";

const startActionClass =
  "bg-brand text-on-brand active:bg-brand-strong disabled:opacity-50";

/** Hvit knapp på mørk flate — teksten må være mørk i begge moduser. */
const stopActionClass = "bg-white text-hero active:bg-white/85";

export function TimeClockPanel({
  mode,
  customerId,
  openClock,
}: {
  mode: "PAYROLL" | "EXTRA_WORK";
  customerId?: string;
  openClock: OpenClockProp;
}) {
  const active = isActiveHere(openClock, mode, customerId);
  const foreign = openClock && !active;

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-hero px-5 py-7 text-white">
      {foreign && openClock ? (
        <ForeignClockNotice openClock={openClock} />
      ) : active && openClock ? (
        <ActiveClock
          startedAtIso={openClock.startedAt}
          title={
            mode === "PAYROLL"
              ? "Lønnstimer"
              : (openClock.customerName ?? "Ekstraarbeid")
          }
          commentPlaceholder={
            mode === "PAYROLL" ? "Hva jobbet du med?" : "Hva ble gjort?"
          }
        />
      ) : (
        <IdleClock mode={mode} customerId={customerId} />
      )}
    </section>
  );
}

function ForeignClockNotice({
  openClock,
}: {
  openClock: NonNullable<OpenClockProp>;
}) {
  if (openClock.kind === "PAYROLL") {
    return (
      <p className="text-body text-white/80">
        Du har en lønnsstempling i gang.{" "}
        <Link href="/timeliste" className="font-semibold underline">
          Gå til timelisten
        </Link>
        .
      </p>
    );
  }

  const href = openClock.customerId
    ? `/kunde/${openClock.customerId}/timer`
    : "/";
  const name = openClock.customerName ?? "en annen kunde";

  return (
    <p className="text-body text-white/80">
      Du har stempling på {name}.{" "}
      <Link href={href} className="font-semibold underline">
        Avslutt der først
      </Link>
      .
    </p>
  );
}

function IdleClock({
  mode,
  customerId,
}: {
  mode: "PAYROLL" | "EXTRA_WORK";
  customerId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow uppercase text-white/50">
          {mode === "PAYROLL" ? "Lønnstimer" : "Ekstraarbeid"}
        </p>
        <p className={`${clockFaceClass} text-white/35`} aria-hidden>
          00:00:00
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        aria-label={pending ? "Starter stempling" : "Start stempling"}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result =
              mode === "PAYROLL"
                ? await startPayrollClock()
                : await startExtraWorkClock(customerId!);
            if (result?.message && !result.message.includes("startet")) {
              setMessage(result.message);
            }
            router.refresh();
          });
        }}
        className={`${fullActionClass} ${startActionClass}`}
      >
        {pending ? (
          "Starter …"
        ) : (
          <>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="currentColor"
            >
              <path d="M8 5.6a1 1 0 0 1 1.52-.85l9 6.4a1 1 0 0 1 0 1.7l-9 6.4A1 1 0 0 1 8 18.4Z" />
            </svg>
            Start stempling
          </>
        )}
      </button>
      {message && (
        <p role="status" className="text-body font-medium text-white/80">
          {message}
        </p>
      )}
    </div>
  );
}

function ActiveClock({
  startedAtIso,
  title,
  commentPlaceholder,
}: {
  startedAtIso: string;
  title: string;
  commentPlaceholder: string;
}) {
  const startedAt = new Date(startedAtIso);
  const [now, setNow] = useState(() => new Date());
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const [hours, setHours] = useState(0.5);
  const [comment, setComment] = useState("");
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    stopTimeClock,
    undefined,
  );
  const [cancelPending, startCancel] = useTransition();
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const router = useRouter();
  const saving = stoppedAt !== null;

  useEffect(() => {
    if (state?.message?.includes("lagret")) {
      router.refresh();
    }
  }, [state?.message, router]);

  useEffect(() => {
    if (stoppedAt) return;
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, [stoppedAt]);

  const displayAt = stoppedAt ?? now;
  const digital = formatDigitalElapsed(startedAt, displayAt);

  function captureStopTime() {
    const end = new Date();
    setStoppedAt(end);
    setNow(end);
    setHours(Math.max(0.5, hoursFromClock(startedAt, end)));
  }

  function resumeClock() {
    setStoppedAt(null);
    setNow(new Date());
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p
          className={`flex items-center gap-2 text-eyebrow uppercase ${
            saving ? "text-white/50" : "text-brand"
          }`}
        >
          {!saving ? (
            <span
              aria-hidden
              className="live-dot size-2 shrink-0 rounded-full bg-brand"
            />
          ) : null}
          {saving ? `Stoppet · ${title}` : `Pågår · ${title}`}
        </p>
        <p
          className={`${clockFaceClass} text-white`}
          aria-live="off"
          aria-label={saving ? `Stoppet på ${digital}` : `Pågår, ${digital}`}
        >
          {digital}
        </p>
      </div>

      {saving ? (
        <button
          type="button"
          disabled={pending}
          aria-label="Fortsett stempling"
          onClick={resumeClock}
          className={`${fullActionClass} border-[1.5px] border-white/30 text-white active:bg-white/10`}
        >
          Fortsett
        </button>
      ) : (
        <button
          type="button"
          aria-label="Stopp stempling"
          onClick={captureStopTime}
          className={`${fullActionClass} ${stopActionClass}`}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4.5"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2.5" />
          </svg>
          Stopp
        </button>
      )}

      {saving && (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="hours" value={hours} />
          <CommentField
            id="clock-comment"
            name="comment"
            value={comment}
            onChange={setComment}
            rows={3}
            placeholder={commentPlaceholder}
            ariaLabel="Kommentar"
          />
          <FieldError messages={state?.errors?.comment} />
          <FieldError messages={state?.errors?.hours} />

          {state?.message && (
            <p role="status" className="text-body font-semibold text-white">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`${fullActionClass} ${startActionClass}`}
          >
            {pending ? "Lagrer …" : `Lagre ${formatHours(hours)} t`}
          </button>
        </form>
      )}

      <button
        type="button"
        disabled={cancelPending || pending}
        onClick={() => {
          if (!window.confirm("Avbryte stempling uten å lagre timer?")) {
            return;
          }
          setCancelMessage(null);
          startCancel(async () => {
            const result = await cancelTimeClock();
            if (result?.message && !result.message.includes("avbrutt")) {
              setCancelMessage(result.message);
            }
            router.refresh();
          });
        }}
        className="min-h-11 self-start text-meta font-semibold text-white/45 underline-offset-4 hover:underline"
      >
        {cancelPending ? "Avbryter …" : "Avbryt"}
      </button>
      {cancelMessage && (
        <p role="status" className="text-body font-medium text-white/80">
          {cancelMessage}
        </p>
      )}
    </div>
  );
}
