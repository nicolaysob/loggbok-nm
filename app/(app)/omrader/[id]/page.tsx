import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { updateArea } from "@/app/actions/areas";
import { AreaForm } from "@/components/area-form";
import { NewTaskTemplateForm } from "./new-task-template-form";
import { TaskTemplateRow } from "./task-template-row";

export default async function AreaPage({ params }: PageProps<"/omrader/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const area = await db.area.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      // Sekundærsortering på id holder rekkefølgen stabil om to skulle dele sortOrder
      taskTemplates: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });

  if (!area) notFound();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link
            href={`/kunder/${area.customer.id}`}
            className="text-sm underline underline-offset-2"
          >
            ← {area.customer.name}
          </Link>
          <h1 className="text-2xl font-bold">{area.name}</h1>
        </div>

        <AreaForm
          action={updateArea.bind(null, area.id)}
          values={{
            name: area.name,
            address: area.address ?? "",
            notes: area.notes ?? "",
          }}
          submitLabel="Lagre område"
        />
      </section>

      <section className="flex max-w-4xl flex-col gap-4">
        <h2 className="text-xl font-bold">Oppgavemaler</h2>

        {area.taskTemplates.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Ingen oppgavemaler er lagt inn på dette området ennå.
          </p>
        ) : (
          <ul className="flex flex-col">
            {area.taskTemplates.map((template, index) => (
              <TaskTemplateRow
                key={template.id}
                template={{
                  id: template.id,
                  title: template.title,
                  frequency: template.frequency,
                }}
                isFirst={index === 0}
                isLast={index === area.taskTemplates.length - 1}
              />
            ))}
          </ul>
        )}

        <NewTaskTemplateForm areaId={area.id} />
      </section>
    </div>
  );
}
