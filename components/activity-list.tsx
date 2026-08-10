import type { ActivityItem } from "@/lib/customer-activity";
import {
  activityKindLabels,
  activityKindTone,
} from "@/lib/customer-activity";
import { formatHours } from "@/lib/format";
import { issueStatusLabels } from "@/lib/labels";
import { formatDate, groupByMonth } from "@/lib/time";
import { PhotoThumbs } from "@/components/photo-thumbs";

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={`text-meta font-semibold ${activityKindTone[item.kind]}`}
        >
          {activityKindLabels[item.kind]}
        </span>
        <span className="font-mono text-meta font-medium text-navy-700">
          {formatDate(item.at)}
        </span>
        {item.hours !== null && (
          <span className="font-mono text-meta font-semibold text-navy-900">
            {formatHours(item.hours)} t
          </span>
        )}
      </div>

      <p className="text-meta font-medium text-navy-700">
        {item.userName}
        {item.status && <> · {issueStatusLabels[item.status]}</>}
      </p>

      {item.text && (
        <p className="text-body whitespace-pre-wrap text-navy-900">
          {item.text}
        </p>
      )}

      {item.tasks.length > 0 && (
        <p className="text-body text-navy-900">{item.tasks.join(", ")}</p>
      )}

      {item.photoUrls.length > 0 && (
        <div className="pt-1">
          <PhotoThumbs urls={item.photoUrls} />
        </div>
      )}
    </li>
  );
}

export function ActivityList({
  items,
  emptyText,
  groupByMonth: useMonthGroups = false,
}: {
  items: ActivityItem[];
  emptyText: string;
  groupByMonth?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="border-y border-line py-5 text-body text-navy-700">
        {emptyText}
      </p>
    );
  }

  if (!useMonthGroups) {
    return (
      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
        {items.map((item) => (
          <ActivityRow key={item.key} item={item} />
        ))}
      </ul>
    );
  }

  const groups = groupByMonth(items, (item) => item.at);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-heading text-navy-900">{group.label}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white shadow-card">
            {group.items.map((item) => (
              <ActivityRow key={item.key} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
