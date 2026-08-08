import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { decimalToNumber } from "@/lib/format";
import { updateCustomer } from "@/app/actions/customers";
import { CustomerForm } from "../customer-form";
import { TaskTemplates } from "./task-templates";

export default async function CustomerAdminPage({
  params,
}: PageProps<"/kunder/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      // Standardområdet er skjult for brukerne, men oppgavemalene ligger der
      areas: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          taskTemplates: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
            select: { id: true, title: true, frequency: true },
          },
        },
      },
    },
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
        <h2 className="text-xl font-bold">Oppgavemaler</h2>
        <TaskTemplates
          customerId={customer.id}
          templates={customer.areas[0]?.taskTemplates ?? []}
        />
      </section>
    </div>
  );
}
