"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { areaSchema, type FormState } from "@/lib/validation";

function readAreaForm(formData: FormData) {
  return {
    name: formData.get("name"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  };
}

export async function createArea(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = areaSchema.safeParse(readAreaForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.area.create({ data: { ...result.data, customerId } });

  revalidatePath(`/kunder/${customerId}`);
  return { message: "Området er lagt til." };
}

export async function updateArea(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = areaSchema.safeParse(readAreaForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const area = await db.area.update({ where: { id }, data: result.data });

  revalidatePath(`/omrader/${id}`);
  revalidatePath(`/kunder/${area.customerId}`);
  return { message: "Området er lagret." };
}
