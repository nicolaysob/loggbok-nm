"use client";

import { useActionState } from "react";
import type { ContractType } from "@/generated/prisma/enums";
import { contractTypeOptions } from "@/lib/labels";
import type { FormState } from "@/lib/validation";
import { Feedback, Field, SubmitButton, inputClass } from "@/components/form";
import { KronerInput } from "@/components/kroner-input";

export type CustomerFormValues = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractType: ContractType | "";
  annualValue?: number;
  active: boolean;
};

export const emptyCustomer: CustomerFormValues = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  contractType: "",
  active: true,
};

export function CustomerForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: CustomerFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Navn" htmlFor="name" errors={state?.errors?.name}>
          <input
            id="name"
            name="name"
            defaultValue={values.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Kontaktperson"
          htmlFor="contactPerson"
          errors={state?.errors?.contactPerson}
        >
          <input
            id="contactPerson"
            name="contactPerson"
            defaultValue={values.contactPerson}
            className={inputClass}
          />
        </Field>

        <Field label="E-post" htmlFor="email" errors={state?.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={values.email}
            className={inputClass}
          />
        </Field>

        <Field label="Telefon" htmlFor="phone" errors={state?.errors?.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={values.phone}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Adresse" htmlFor="address" errors={state?.errors?.address}>
        <input
          id="address"
          name="address"
          defaultValue={values.address}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Kontraktstype"
          htmlFor="contractType"
          errors={state?.errors?.contractType}
        >
          <select
            id="contractType"
            name="contractType"
            defaultValue={values.contractType}
            required
            className={inputClass}
          >
            <option value="">Velg …</option>
            {contractTypeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Årlig kontraktssum (kr)"
          htmlFor="annualValue"
          errors={state?.errors?.annualValue}
        >
          <KronerInput
            id="annualValue"
            name="annualValue"
            defaultValue={values.annualValue}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-meta font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={values.active}
          className="size-4"
        />
        Aktiv
      </label>

      <div className="flex items-center gap-4">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Feedback message={state?.message} />
      </div>
    </form>
  );
}
