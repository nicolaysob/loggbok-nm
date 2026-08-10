"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IssueStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { photosFromFormData } from "@/lib/photos";
import { issueSchema, type FormState } from "@/lib/validation";

export async function createIssue(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const result = issueSchema.safeParse({
    description: formData.get("description"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const photoResult = await photosFromFormData(formData);
  if ("error" in photoResult) {
    return { errors: { photos: [photoResult.error] } };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område og kan ikke registreres på." };
  }

  await db.issue.create({
    data: {
      areaId,
      userId: user.id,
      description: result.data.description,
      status: "OPEN",
      photos: {
        create: photoResult.photos,
      },
    },
  });

  revalidatePath(`/kunde/${customerId}`);
  revalidatePath(`/kunde/${customerId}/avvik`);
  revalidatePath("/");
  revalidatePath("/uke");
  redirect(`/kunde/${customerId}?lagret=1`);
}

export async function setIssueStatus(issueId: string, status: IssueStatus) {
  await requireUser();

  const issue = await db.issue.update({
    where: { id: issueId },
    data: {
      status,
      // closedAt følger statusen, så et gjenåpnet avvik ikke ser lukket ut
      closedAt: status === "CLOSED" ? new Date() : null,
    },
    select: { area: { select: { customerId: true } } },
  });

  revalidatePath(`/kunde/${issue.area.customerId}`);
  revalidatePath(`/kunde/${issue.area.customerId}/avvik`);
  revalidatePath("/");
  revalidatePath("/uke");
}
