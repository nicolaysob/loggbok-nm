import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Slår opp brukeren bak sesjons-cookien. Memoisert med cache() så flere
// komponenter i samme render deler ett databasekall.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    // Aldri hent passordHash inn i render-laget
    select: { id: true, name: true, email: true, role: true },
  });
});

// Den faktiske sikkerhetsgrensen. Kall denne i hver beskyttet side og
// server action — proxy.ts er bare en rask forhåndssjekk.
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

// Administrasjonssidene. Ansatte sendes stille til forsiden — proxy.ts sjekker
// bare om man er innlogget, ikke hvilken rolle man har.
export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
});
