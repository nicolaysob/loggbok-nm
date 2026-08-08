import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { LogForm } from "./log-form";

export default async function LogVisitPage({
  params,
}: PageProps<"/kunde/[id]/loggfor">) {
  await requireUser();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`/kunde/${customer.id}`}
          className="inline-flex min-h-12 items-center text-base underline underline-offset-2"
        >
          ← {customer.name}
        </Link>
        <h1 className="text-2xl font-bold">Loggfør besøk</h1>
      </div>

      <LogForm customerId={customer.id} />
    </div>
  );
}
