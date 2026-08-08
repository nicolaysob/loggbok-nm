import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { contractTypeLabels } from "@/lib/labels";
import { decimalToNumber, formatKroner } from "@/lib/format";

export default async function CustomersPage() {
  await requireAdmin();

  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kunder</h1>
        <Link
          href="/kunder/ny"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Ny kunde
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-neutral-600">Ingen kunder er lagt inn ennå.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/20 text-left">
              <th className="py-2 font-semibold">Navn</th>
              <th className="py-2 font-semibold">Kontraktstype</th>
              <th className="py-2 text-right font-semibold">Årlig sum</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-black/10">
                <td className="py-2">
                  <Link
                    href={`/kunder/${customer.id}`}
                    className="font-medium underline underline-offset-2"
                  >
                    {customer.name}
                  </Link>
                  {!customer.active && (
                    <span className="ml-2 text-neutral-500">(inaktiv)</span>
                  )}
                </td>
                <td className="py-2">
                  {contractTypeLabels[customer.contractType]}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatKroner(decimalToNumber(customer.annualValue))} kr
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
