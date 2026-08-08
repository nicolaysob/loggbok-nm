"use client";

import { useFormStatus } from "react-dom";

export const inputClass =
  "w-full rounded border border-black/25 bg-white px-3 py-2 text-sm text-neutral-900 " +
  "outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

export function Field({
  label,
  htmlFor,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {errors?.map((error) => (
        <p key={error} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ))}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Lagrer …",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white
                 hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Feedback({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="status" className="text-sm font-medium text-green-700">
      {message}
    </p>
  );
}
