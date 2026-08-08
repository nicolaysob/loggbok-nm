"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Fyll inn både e-post og passord." };
  }

  const user = await db.user.findUnique({ where: { email } });

  // Samme feilmelding uansett om det er e-posten eller passordet som er feil,
  // så ingen kan kartlegge hvilke e-poster som finnes
  if (!user || !(await compare(password, user.passwordHash))) {
    return { error: "Feil e-post eller passord." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
