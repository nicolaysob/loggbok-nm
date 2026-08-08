"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { taskTemplateSchema, type FormState } from "@/lib/validation";

function readTaskTemplateForm(formData: FormData) {
  return {
    title: formData.get("title"),
    frequency: formData.get("frequency"),
  };
}

export async function createTaskTemplate(
  areaId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = taskTemplateSchema.safeParse(readTaskTemplateForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  // Legg nye oppgaver nederst i lista
  const last = await db.taskTemplate.findFirst({
    where: { areaId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await db.taskTemplate.create({
    data: { ...result.data, areaId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });

  revalidatePath(`/omrader/${areaId}`);
  return { message: "Oppgaven er lagt til." };
}

export async function updateTaskTemplate(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = taskTemplateSchema.safeParse(readTaskTemplateForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const template = await db.taskTemplate.update({
    where: { id },
    data: result.data,
  });

  revalidatePath(`/omrader/${template.areaId}`);
  return { message: "Lagret." };
}

export async function deleteTaskTemplate(id: string) {
  await requireAdmin();

  const template = await db.taskTemplate.delete({ where: { id } });

  revalidatePath(`/omrader/${template.areaId}`);
}

export async function moveTaskTemplate(id: string, direction: "up" | "down") {
  await requireAdmin();

  const current = await db.taskTemplate.findUniqueOrThrow({ where: { id } });

  // Naboen i valgt retning — den vi skal bytte plass med
  const neighbour = await db.taskTemplate.findFirst({
    where: {
      areaId: current.areaId,
      sortOrder:
        direction === "up"
          ? { lt: current.sortOrder }
          : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  // Allerede øverst eller nederst
  if (!neighbour) return;

  await db.$transaction([
    db.taskTemplate.update({
      where: { id: current.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    db.taskTemplate.update({
      where: { id: neighbour.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidatePath(`/omrader/${current.areaId}`);
}
