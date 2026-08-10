import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { formatDate } from "@/lib/time";
import { backLinkClass, cardStaticClass } from "@/lib/ui";

export default async function MessageArchivePage({
  params,
}: PageProps<"/kunde/[id]/meldingsarkiv">) {
  await requireUser();
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!customer) notFound();

  const messages = await db.customerMessage.findMany({
    where: { customerId: id, readAt: { not: null } },
    orderBy: { readAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      readAt: true,
      user: { select: { name: true } },
      signedBy: { select: { name: true } },
    },
  });

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/kunde/${customer.id}`} className={backLinkClass}>
          ← {customer.name}
        </Link>
        <h1 className="text-display tracking-tight">Meldingsarkiv</h1>
        <p className="text-body text-navy-700">
          Signerte meldinger fra kunden.
        </p>
      </div>

      {messages.length === 0 ? (
        <p className={`px-4 py-5 text-body text-navy-700 ${cardStaticClass}`}>
          Ingen signerte meldinger ennå.
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {messages.map((message) => (
            <li key={message.id} className="flex flex-col gap-1 py-3.5">
              <p className="text-meta font-medium text-navy-700">
                <span className="font-mono">
                  {formatDate(message.createdAt)}
                </span>
                {" · "}
                {message.user.name}
              </p>
              <p className="text-body whitespace-pre-wrap text-navy-900">
                {message.body}
              </p>
              {message.readAt && message.signedBy && (
                <p className="text-meta font-medium text-green-700">
                  Signert av {message.signedBy.name} ·{" "}
                  {formatDate(message.readAt)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
