import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { UsersManager } from "./users-manager";

export default async function UsersPage() {
  const admin = await requireAdmin();

  const users = await db.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      payType: true,
      active: true,
    },
  });

  return (
    <div className="flex animate-rise flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight">Brukere</h1>
        <p className="text-body text-navy-700">
          Opprett brukere, bytt rolle og sett lønnstype. Timesbetalte får
          timeliste. Deaktiverte kan ikke logge inn.
        </p>
      </div>

      <UsersManager
        users={users.map((user) => ({
          ...user,
          isSelf: user.id === admin.id,
        }))}
      />
    </div>
  );
}
