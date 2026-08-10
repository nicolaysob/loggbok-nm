"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { PayType, Role } from "@/generated/prisma/enums";
import {
  createUser,
  resetUserPassword,
  setUserActive,
  setUserPayType,
  setUserRole,
} from "@/app/actions/users";
import { payTypeLabels, payTypeOptions, roleOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { outlineActionClass, solidActionClass } from "@/lib/ui";

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Ansatt",
};

export type UserRow = {
  id: string;
  name: string;
  username: string;
  role: Role;
  payType: PayType;
  active: boolean;
  isSelf: boolean;
};

export function UsersManager({ users }: { users: UserRow[] }) {
  return (
    <div className="flex flex-col gap-8">
      <CreateUserForm />

      <ul className="flex flex-col gap-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}

function UserCard({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className={`rounded-md border border-line bg-white ${
        user.active ? "" : "opacity-70"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3.5 text-left active:bg-navy-50"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-heading text-navy-900">
            {user.name}
            {user.isSelf && (
              <span className="ml-2 text-meta font-medium text-navy-700">
                (deg)
              </span>
            )}
          </span>
          <span className="block font-mono text-meta text-navy-700">
            {user.username}
            {" · "}
            {payTypeLabels[user.payType]}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-meta font-semibold ${
            user.role === "ADMIN"
              ? "bg-brand/10 text-brand-dark"
              : "bg-navy-50 text-navy-700"
          }`}
        >
          {roleLabels[user.role]}
          {!user.active && " · av"}
        </span>
        <span aria-hidden className="text-heading text-navy-100">
          {open ? "▾" : "›"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-4 py-4">
          <p className="text-meta font-semibold text-navy-700">Rolle</p>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map(([role, label]) => (
              <form key={role} action={setUserRole.bind(null, user.id, role)}>
                <button
                  type="submit"
                  disabled={user.role === role}
                  className={`min-h-12 rounded-md px-4 text-meta font-semibold disabled:opacity-40 ${
                    user.role === role ? solidActionClass : outlineActionClass
                  }`}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>

          <p className="text-meta font-semibold text-navy-700">Lønn</p>
          <div className="flex flex-wrap gap-2">
            {payTypeOptions.map(([payType, label]) => (
              <form
                key={payType}
                action={setUserPayType.bind(null, user.id, payType)}
              >
                <button
                  type="submit"
                  disabled={user.payType === payType}
                  className={`min-h-12 rounded-md px-4 text-meta font-semibold disabled:opacity-40 ${
                    user.payType === payType
                      ? solidActionClass
                      : outlineActionClass
                  }`}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>

          {!user.isSelf && (
            <form action={setUserActive.bind(null, user.id, !user.active)}>
              <button
                type="submit"
                className={`min-h-12 w-full rounded-md px-4 text-meta font-semibold ${outlineActionClass}`}
              >
                {user.active ? "Deaktiver" : "Aktiver"}
              </button>
            </form>
          )}

          <ResetPasswordForm userId={user.id} />
        </div>
      )}
    </li>
  );
}

function CreateUserForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createUser,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex max-w-lg flex-col gap-3 rounded-md border border-line bg-white p-4"
    >
      <p className="text-heading">Ny bruker</p>

      <Field label="Navn" htmlFor="name" errors={state?.errors?.name}>
        <input id="name" name="name" required className={inputClass} />
      </Field>

      <Field
        label="Brukernavn"
        htmlFor="username"
        errors={state?.errors?.username}
      >
        <input
          id="username"
          name="username"
          required
          autoCapitalize="none"
          autoCorrect="off"
          className={inputClass}
        />
      </Field>

      <Field
        label="Passord"
        htmlFor="password"
        errors={state?.errors?.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={4}
          className={inputClass}
        />
      </Field>

      <Field label="Rolle" htmlFor="role" errors={state?.errors?.role}>
        <select
          id="role"
          name="role"
          required
          defaultValue="EMPLOYEE"
          className={inputClass}
        >
          {roleOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Lønn" htmlFor="payType" errors={state?.errors?.payType}>
        <select
          id="payType"
          name="payType"
          required
          defaultValue="FIXED"
          className={inputClass}
        >
          {payTypeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Oppretter …">Opprett</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}

function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    resetUserPassword.bind(null, userId),
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Field
        label="Nytt passord"
        htmlFor={`password-${userId}`}
        errors={state?.errors?.password}
      >
        <input
          id={`password-${userId}`}
          name="password"
          type="password"
          required
          minLength={4}
          className={inputClass}
        />
      </Field>
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Lagrer …">Sett passord</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
