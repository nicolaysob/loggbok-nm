import { z } from "zod";
import { ContractType, Frequency } from "@/generated/prisma/enums";
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
      // Kolonnen er Decimal(10,2), altså maks åtte siffer foran komma
      .max(99_999_999.99, { error: "Kontraktssum er for høy" }),
  ),
  active: z.boolean(),
});

export const areaSchema = z.object({
  name: z.string().trim().min(1, { error: "Navn må fylles ut" }),
  address: optionalText,
  notes: optionalText,
});

// Besøksnotat: bare fritekst, ingen timer og ingen oppgaver
export const visitNoteSchema = z.object({
  comment: z.string().trim().min(1, { error: "Skriv et notat om besøket" }),
});

// Ekstraarbeid er fakturerbart, så både timer og beskrivelse er påkrevd —
// en faktura­linje uten forklaring er ubrukelig i ettertid.
// 0,5 er minste registrerbare, 24 er en åpenbar øvre grense per innføring.
export const extraWorkSchema = z.object({
  hours: z.preprocess(
    (value) => parseDecimal(String(value ?? "")),
    z
      .number({ error: "Fyll inn antall timer" })
      .min(0.5, { error: "Ekstraarbeid må være minst 0,5 time" })
      .max(24, { error: "En registrering kan ikke være over 24 timer" }),
  ),
  comment: z
    .string()
    .trim()
    .min(1, { error: "Beskriv hva som ble gjort" }),
});

// Avvik har ingen timer — ekstraarbeid registreres som EXTRA_WORK
export const issueSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { error: "Beskriv avviket" }),
});

export const taskTemplateSchema = z.object({
  title: z.string().trim().min(1, { error: "Tittel må fylles ut" }),
  frequency: z.enum(Frequency, { error: "Velg frekvens" }),
});

export type FormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
    }
  | undefined;
