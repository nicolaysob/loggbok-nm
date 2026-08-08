import { requireUser } from "@/lib/dal";

const roleLabels = {
  ADMIN: "Administrator",
  EMPLOYEE: "Ansatt",
} as const;

export default async function HomePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Innlogget</h1>
      <p className="text-lg">{user.name}</p>
      <p className="text-base text-neutral-600">{user.email}</p>
      <p className="text-base text-neutral-600">{roleLabels[user.role]}</p>
    </div>
  );
}
