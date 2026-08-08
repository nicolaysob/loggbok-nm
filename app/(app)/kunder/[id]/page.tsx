import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber } from "@/lib/format";
import { updateCustomer } from "@/app/actions/customers";
import { createArea } from "@/app/actions/areas";
import { AreaForm, emptyArea } from "@/components/area-form";
import { CustomerForm } from "../customer-form";

export default async function CustomerPage({
  params,
}: PageProps<"/kunder/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: { areas: { orderBy: { name: "asc" } } },
  });

  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/kunder" className="text-sm underline underline-offset-2">
            ← Kunder
          </Link>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
        </div>

        <CustomerForm
          action={updateCustomer.bind(null, customer.id)}
          values={{
            name: customer.name,
            contactPerson: customer.contactPerson ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            address: customer.address ?? "",
            contractType: customer.contractType,
            // Decimal kan ikke sendes til en klientkomponent
            annualValue: decimalToNumber(customer.annualValue),
            active: customer.active,
          }}
          submitLabel="Lagre kunde"
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Områder</h2>

        {customer.areas.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Ingen områder er lagt inn på denne kunden ennå.
          </p>
        ) : (
          <ul className="flex max-w-2xl flex-col gap-2">
            {customer.areas.map((area) => (
              <li
                key={area.id}
                className="flex items-baseline justify-between border-b border-black/10 pb-2"
              >
                <Link
                  href={`/omrader/${area.id}`}
                  className="text-sm font-medium underline underline-offset-2"
                >
                  {area.name}
                </Link>
                <span className="text-sm text-neutral-600">
                  {area.address ?? ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Nytt område</h2>
        <AreaForm
          action={createArea.bind(null, customer.id)}
          values={emptyArea}
          submitLabel="Legg til område"
          resetOnSuccess
        />
      </section>
    </div>
  );
}
