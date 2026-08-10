import { z } from "zod";
import {
  ContractType,
  Frequency,
  JobScheduleKind,
} from "@/generated/prisma/enums";
import { parseDecimal } from "@/lib/format";

// Tomme tekstfelt skal lagres som null, ikke som tom streng
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

export const customerSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
  contactPerson: optionalText,
  email: optionalText.refine(
    (value) => value === null || z.email().safeParse(value).success,
    { error: "Ugyldig e-postadresse" },
  ),
  phone: optionalText,
  address: optionalText,
  contractType: z.enum(ContractType, { error: "Velg kontraktstype" }),
  annualValue: z.preprocess(
    (value) => parseDecimal(String(value ?? "")),
    z
      .number({ error: "Kontraktssum må fylles ut som et tall" })
      .min(0, { error: "Kontraktssum kan ikke være negativ" })
      .max(99_999_999.99, { error: "Kontraktssum er for høy" }),
  ),
  active: z.boolean(),
});

export const areaSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
  address: optionalText,
  notes: optionalText,
});

export const visitNoteSchema = z.object({
  comment: z.string().trim().min(1, { error: "Skriv et notat om besøket" }),
});

export const extraWorkSchema = z.object({
  hours: z.preprocess(
    (value) => parseDecimal(String(value ?? "")),
    z
      .number({ error: "Fyll inn antall timer" })
      .min(0.5, { error: "Ekstraarbeid må være minst 0,5 time" })
      .max(24, { error: "En registrering kan ikke være over 24 timer" }),
  ),
  comment: z.string().trim().min(1, { error: "Beskriv hva som ble gjort" }),
});

export const issueSchema = z.object({
  description: z.string().trim().min(1, { error: "Beskriv avviket" }),
});

export const taskTemplateSchema = z.object({
  title: z.string().trim().min(1, { error: "Tittel må fylles ut" }),
  frequency: z.enum(Frequency, { error: "Velg frekvens" }),
});

export const jobTypeSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
});

export const customerJobSchema = z
  .object({
    title: z.string().trim().min(1, { error: "Skriv hva oppdraget er" }),
    jobTypeId: z
      .string()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : null)),
    kind: z.enum(JobScheduleKind, { error: "Velg frekvens" }),
    dueOn: z.string().optional(),
    weekday: z.string().optional(),
    startsOn: z.string().optional(),
    notes: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.kind === "ONCE") {
      if (!value.dueOn) {
        ctx.addIssue({
          code: "custom",
          path: ["dueOn"],
          message: "Velg dato for engangsoppdrag",
        });
      }
    } else if (!value.startsOn) {
      ctx.addIssue({
        code: "custom",
        path: ["startsOn"],
        message: "Velg startdato",
      });
    }

    if (
      (value.kind === "WEEKLY" || value.kind === "BIWEEKLY") &&
      (value.weekday === undefined ||
        value.weekday === "" ||
        Number.isNaN(Number(value.weekday)))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["weekday"],
        message: "Velg ukedag",
      });
    }
  });

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;
