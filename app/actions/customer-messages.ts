"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/dal";
import { customerMessageSchema, type FormState } from "@/lib/validation";

export async function createCustomerMessage(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer();

  const result = customerMessageSchema.safeParse({
    body: formData.get("body"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  await db.customerMessage.create({
    data: {
      customerId: user.customerId,
      userId: user.id,
      body: result.data.body,
    },
  });

  revalidatePath("/portal");
  revalidatePath(`/kunde/${user.customerId}`);
  revalidatePath("/");
  return { message: "Meldingen er sendt." };
}
