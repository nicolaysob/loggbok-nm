"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCustomer, requireUser } from "@/lib/dal";
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

export async function signCustomerMessage(messageId: string): Promise<void> {
  const user = await requireUser();

  const message = await db.customerMessage.findUnique({
    where: { id: messageId },
    select: { id: true, customerId: true, readAt: true },
  });
  if (!message || message.readAt) return;

  await db.customerMessage.update({
    where: { id: message.id },
    data: {
      readAt: new Date(),
      signedByUserId: user.id,
    },
  });

  revalidatePath(`/kunde/${message.customerId}`);
  revalidatePath(`/kunde/${message.customerId}/meldingsarkiv`);
  revalidatePath("/");
}
