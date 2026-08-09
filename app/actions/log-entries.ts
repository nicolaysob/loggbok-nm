"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { photosFromFormData } from "@/lib/photos";
import {
  extraWorkSchema,
  visitNoteSchema,
  type FormState,
} from "@/lib/validation";

const MISSING_AREA = "Kunden mangler område og kan ikke registreres på.";

function done(customerId: string): never {
  revalidatePath("/");
  revalidatePath(`/kunde/${customerId}`);
  revalidatePath("/uke");
  revalidatePath("/mnd");
  redirect(`/kunde/${customerId}?lagret=1`);
}

export async function createVisitNote(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const result = visitNoteSchema.safeParse({
    comment: formData.get("comment"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const photoResult = await photosFromFormData(formData);
  if ("error" in photoResult) {
    return { errors: { photos: [photoResult.error] } };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  await db.logEntry.create({
    data: {
      areaId,
      userId: user.id,
      occurredAt: new Date(),
      type: "VISIT_NOTE",
      comment: result.data.comment,
      photos: {
        create: photoResult.photos,
      },
    },
  });

  done(customerId);
}

export async function completeTasks(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  // Godta bare oppgaver som faktisk hører til denne kunden — id-ene kommer
  // fra skjemaet og kan ikke stoles på
  const checkedIds = formData.getAll("tasks").map(String);
  const ownTasks = await db.taskTemplate.findMany({
    where: { id: { in: checkedIds }, areaId },
    select: { id: true },
  });

  if (ownTasks.length === 0) {
    return { message: "Huk av minst én oppgave." };
  }

  await db.logEntry.create({
    data: {
      areaId,
      userId: user.id,
      occurredAt: new Date(),
      type: "TASK_COMPLETION",
      completedTasks: {
        create: ownTasks.map((task) => ({ taskTemplateId: task.id })),
      },
    },
  });

  done(customerId);
}

export async function createExtraWork(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const result = extraWorkSchema.safeParse({
    hours: formData.get("hours"),
    comment: formData.get("comment"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) return { message: MISSING_AREA };

  await db.logEntry.create({
    data: {
      areaId,
      userId: user.id,
      occurredAt: new Date(),
      type: "EXTRA_WORK",
      hours: result.data.hours,
      comment: result.data.comment,
    },
  });

  done(customerId);
}
