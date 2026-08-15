import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffAccess } from "@/lib/dal";
import { osloDateTimeLocalKey } from "@/lib/period";
import { BackLink } from "@/components/back-link";
import { LogForm } from "./log-form";

export default async function LogVisitPage({
  params,
}: PageProps<"/kunde/[id]/loggfor">) {
  await requireStaffAccess("log");
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  return (
    <div className="mx-auto flex w-full max-w-lg animate-rise flex-col gap-6">
      <div className="-mx-2 flex items-center gap-1">
        <BackLink fallback={`/kunde/${customer.id}`} />
        <h1 className="min-w-0 truncate text-heading">{customer.name}</h1>
      </div>

      <LogForm
        customerId={customer.id}
        defaultDateTime={osloDateTimeLocalKey()}
      />
    </div>
  );
}
