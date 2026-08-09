"use client";

import type { IssueStatus } from "@/generated/prisma/enums";
import { issueStatusLabels } from "@/lib/labels";
import { setIssueStatus } from "@/app/actions/issues";
import { cardStaticClass, outlineActionClass } from "@/lib/ui";
import { PhotoThumbs } from "@/components/photo-thumbs";

export type IssueItem = {
  id: string;
  description: string;
  status: IssueStatus;
  created: string;
  reportedBy: string;
  photoUrls: string[];
};

// Åpent avvik er rødt. Under arbeid og lukket dempes ned til marineblått,
// så bare det som faktisk krever handling roper.
const badgeClasses: Record<IssueStatus, string> = {
  OPEN: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-navy-50 text-navy-900",
  CLOSED: "bg-navy-100 text-navy-700",
};

const allStatuses: IssueStatus[] = ["OPEN", "IN_PROGRESS", "CLOSED"];

export function IssueList({ issues }: { issues: IssueItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className={`flex flex-col gap-3 px-4 py-3 ${cardStaticClass}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-meta font-semibold ${badgeClasses[issue.status]}`}
            >
              {issueStatusLabels[issue.status]}
            </span>
            <span className="font-mono text-meta font-medium text-navy-700">
              {issue.created}
            </span>
            <span className="text-meta font-medium text-navy-700">
              {issue.reportedBy}
            </span>
          </div>

          <p className="text-body text-navy-900">{issue.description}</p>

          <PhotoThumbs urls={issue.photoUrls} />

          {/* Bare de statusene avviket ikke allerede har — ett trykk, ingen nedtrekksliste */}
          <div className="flex flex-wrap gap-2">
            {allStatuses
              .filter((status) => status !== issue.status)
              .map((status) => (
                <form
                  key={status}
                  action={setIssueStatus.bind(null, issue.id, status)}
                >
                  <button
                    type="submit"
                    className={`min-h-16 rounded-2xl px-4 text-meta font-semibold ${outlineActionClass}`}
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
