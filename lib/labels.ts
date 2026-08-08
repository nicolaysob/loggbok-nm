import { ContractType, Frequency } from "@/generated/prisma/enums";

export const contractTypeLabels: Record<ContractType, string> = {
  YEAR_ROUND: "Helår",
  SUMMER: "Sommer",
  WINTER: "Vinter",
  CLEANING: "Renhold",
};

export const frequencyLabels: Record<Frequency, string> = {
  DAILY: "Daglig",
  WEEKLY: "Ukentlig",
  MONTHLY: "Månedlig",
  AS_NEEDED: "Ved behov",
};

export const contractTypeOptions = Object.entries(contractTypeLabels) as [
  ContractType,
  string,
][];

export const frequencyOptions = Object.entries(frequencyLabels) as [
  Frequency,
  string,
][];
