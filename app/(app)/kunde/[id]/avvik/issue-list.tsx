"use client";

import type { IssueStatus } from "@/generated/prisma/enums";
import { issueStatusLabels } from "@/lib/labels";
import { setIssueStatus } from "@/app/actions/issues";

export type IssueItem = {
  id: string;
  description: string;
  status: IssueStatus;
  created: string;
  reportedBy: string;
};

const badgeClasses: Record<IssueStatus, string> = {
  OPEN: "border-red-800 bg-red-50 text-red-900",
  IN_PROGRESS: "border-amber-700 bg-amber-50 text-amber-900",
  CLOSED: "border-neutral-500 bg-neutral-100 text-neutral-700",
};

const allStatuses: IssueStatus[] = ["OPEN", "IN_PROGRESS", "CLOSED"];

export function IssueList({ issues }: { issues: IssueItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className="flex flex-col gap-3 rounded-xl border-2 border-neutral-300 px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-sm font-semibold ${badgeClasses[issue.status]}`}
            >
              {issueStatusLabels[issue.status]}
            </span>
            <span className="text-sm text-neutral-700">
              {issue.created} · {issue.reportedBy}
            </span>
          </div>

          <p className="text-base text-neutral-950">{issue.description}</p>

          {/* Bare de statusene avviket ikke allerede har — ett trykk, ingen nedtrekksliste */}
          <div className="flex flex-wrap gap-2">
            {allStatuses
              .filter((status) => status !== issue.status)
              .map((status) => (
                <form key={status} action={setIssueStatus.bind(null, issue.id, status)}>
                  <button
                    type="submit"
                    className="min-h-12 rounded-xl border-2 border-neutral-900 px-4 text-base font-medium active:bg-neutral-100"
                  >
                    {issueStatusLabels[status]}
                  </button>
                </form>
              ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
