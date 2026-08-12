import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { osloTimeKey, osloYmd, ymdKey } from "@/lib/period";
import { backLinkClass } from "@/lib/ui";
import { HoursForm } from "./hours-form";

export default async function ExtraWorkPage({
  params,
}: PageProps<"/kunde/[id]/timer">) {
  await requireUser();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const now = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Link href={`/kunde/${customer.id}`} className={backLinkClass}>
          ← {customer.name}
        </Link>
        <h1 className="text-display tracking-tight">Timeregistrering</h1>
      </div>

      <HoursForm
        customerId={customer.id}
        defaultDate={ymdKey(osloYmd(now))}
        defaultTime={osloTimeKey(now)}
      />
    </div>
  );
}
