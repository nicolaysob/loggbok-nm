"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IssueStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { primaryAreaId } from "@/lib/customer";
import { issueSchema, type FormState } from "@/lib/validation";

export async function createIssue(
  customerId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const result = issueSchema.safeParse({
    description: formData.get("description"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const areaId = await primaryAreaId(customerId);
  if (!areaId) {
    return { message: "Kunden mangler område og kan ikke registreres på." };
  }

  await db.issue.create({
    data: { areaId, description: result.data.description, status: "OPEN" },
  });

  revalidatePath(`/kunde/${customerId}/avvik`);
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

  revalidatePath(`/kunde/${issue.area.customerId}/avvik`);
}
