import {
  ContractType,
  Frequency,
  IssueStatus,
  LogType,
} from "@/generated/prisma/enums";

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

export const logTypeLabels: Record<LogType, string> = {
  VISIT_NOTE: "Besøk",
  TASK_COMPLETION: "Oppgaver",
  EXTRA_WORK: "Ekstraarbeid",
};

export const issueStatusLabels: Record<IssueStatus, string> = {
  OPEN: "Åpen",
  IN_PROGRESS: "Under arbeid",
  CLOSED: "Lukket",
};

// Åpne avvik skal ligge øverst, lukkede nederst
export const issueStatusOrder: IssueStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
];

// Frekvensene i den rekkefølgen de skal grupperes på oppgavesiden
export const frequencyOrder: Frequency[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "AS_NEEDED",
];

export const contractTypeOptions = Object.entries(contractTypeLabels) as [
  ContractType,
  string,
][];

export const frequencyOptions = Object.entries(frequencyLabels) as [
  Frequency,
  string,
][];
