"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { PayType, Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import {
  createUserSchema,
  resetPasswordSchema,
  type FormState,
} from "@/lib/validation";

function revalidateUsers() {
  revalidatePath("/brukere");
}

async function adminCountExcluding(userId: string) {
  return db.user.count({
    where: {
      role: "ADMIN",
      active: true,
      id: { not: userId },
    },
  });
}

export async function createUser(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    payType: formData.get("payType"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const existing = await db.user.findUnique({
    where: { username: result.data.username },
    select: { id: true },
  });
  if (existing) {
    return { errors: { username: ["Brukernavnet er opptatt."] } };
  }

  const passwordHash = await hash(result.data.password, 10);

  await db.user.create({
    data: {
      name: result.data.name,
      username: result.data.username,
      passwordHash,
      role: result.data.role,
      payType: result.data.payType,
      active: true,
    },
  });

  revalidateUsers();
  return { message: "Bruker opprettet." };
}

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== "ADMIN") {
    const others = await adminCountExcluding(userId);
    if (others === 0) {
      return;
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidateUsers();
}

export async function setUserPayType(userId: string, payType: PayType) {
  await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: { payType },
  });
  revalidateUsers();
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (admin.id === userId && !active) {
    return;
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return;

  if (!active && target.role === "ADMIN") {
    const others = await adminCountExcluding(userId);
    if (others === 0) return;
  }

  await db.user.update({
    where: { id: userId },
    data: { active },
  });
  revalidateUsers();
}

export async function resetUserPassword(
  userId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const passwordHash = await hash(result.data.password, 10);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidateUsers();
  return { message: "Passord oppdatert." };
}
