import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`/kunde/${customer.id}`}
          className="inline-flex min-h-12 items-center text-base underline underline-offset-2"
        >
          ← {customer.name}
        </Link>
        <h1 className="text-2xl font-bold">Timeregistrering</h1>
      </div>

      <HoursForm customerId={customer.id} />
    </div>
  );
}
