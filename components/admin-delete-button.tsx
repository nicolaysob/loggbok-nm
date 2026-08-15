"use client";

import { useTransition } from "react";
import { deleteIssue } from "@/app/actions/issues";
import { deleteLogEntry } from "@/app/actions/log-entries";

// Slettehandling forbeholdt admin. Bekreftelse i to steg (window.confirm)
// siden sletting ikke kan angres.
export function AdminDeleteButton({
  target,
  id,
  confirmText,
  className,
}: {
  target: "log" | "issue";
  id: string;
  confirmText: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(() =>
      target === "issue" ? deleteIssue(id) : deleteLogEntry(id),
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={
        className ??
        "min-h-12 rounded-xl px-3 text-meta font-semibold text-danger transition-colors active:bg-danger-soft disabled:opacity-50"
      }
    >
      {pending ? "Sletter …" : "Slett"}
    </button>
  );
}
