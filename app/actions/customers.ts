"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { customerSchema, type FormState } from "@/lib/validation";

function readCustomerForm(formData: FormData) {
  return {
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    contractType: formData.get("contractType"),
    annualValue: formData.get("annualValue"),
    active: formData.get("active") === "on",
  };
}

export async function createCustomer(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = customerSchema.safeParse(readCustomerForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const customer = await db.customer.create({ data: result.data });

  revalidatePath("/kunder");
  redirect(`/kunder/${customer.id}`);
}

export async function updateCustomer(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = customerSchema.safeParse(readCustomerForm(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.customer.update({ where: { id }, data: result.data });

  revalidatePath("/kunder");
  revalidatePath(`/kunder/${id}`);
  return { message: "Kunden er lagret." };
}
