import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Minimal seed: kun de to brukerne som trengs for å logge inn.
// Kunder, områder og oppgavemaler legges inn gjennom grensesnittet.
const users = [
  {
    name: "Nicolay",
    email: "admin@loggbok.no",
    password: "admin-dev-2026",
    role: "ADMIN" as const,
  },
  {
    name: "Ansatt",
    email: "ansatt@loggbok.no",
    password: "ansatt-dev-2026",
    role: "EMPLOYEE" as const,
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash: await hash(user.password, 10),
        role: user.role,
      },
    });
    console.log(`Klar ${user.role}: ${user.email}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
