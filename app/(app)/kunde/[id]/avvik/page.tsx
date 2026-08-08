import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { issueStatusOrder } from "@/lib/labels";
import { formatDate } from "@/lib/time";
import { IssueForm } from "./issue-form";
import { IssueList, type IssueItem } from "./issue-list";

export default async function IssuesPage({
  params,
}: PageProps<"/kunde/[id]/avvik">) {
  await requireUser();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const issues = await db.issue.findMany({
    where: { area: { customerId: id } },
    orderBy: { createdAt: "desc" },
    select: { id: true, description: true, status: true, createdAt: true },
  });

  // Åpne først, lukkede nederst. Innenfor hver status nyeste først,
  // som allerede er rekkefølgen fra spørringen.
  const sorted: IssueItem[] = issues
    .slice()
    .sort(
      (a, b) =>
        issueStatusOrder.indexOf(a.status) - issueStatusOrder.indexOf(b.status),
    )
    .map((issue) => ({
      id: issue.id,
      description: issue.description,
      status: issue.status,
      created: formatDate(issue.createdAt),
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/kunde/${customer.id}`}
          className="inline-flex min-h-12 items-center text-base underline underline-offset-2"
        >
          ← {customer.name}
        </Link>
        <h1 className="text-2xl font-bold">Meld avvik</h1>
      </div>

      <IssueForm customerId={customer.id} />

      {sorted.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-neutral-700">
            Registrerte avvik
          </h2>
          <IssueList issues={sorted} />
        </section>
      )}
    </div>
  );
}
