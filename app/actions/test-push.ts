"use server";

import { requireAdmin } from "@/lib/dal";
import { notifyUserPush } from "@/lib/onesignal-server";

export type TestPushResult = {
  ok: boolean;
  message: string;
};

/** Midlertidig: send testvarsel bare til innlogget admin. */
export async function sendTestPush(): Promise<TestPushResult> {
  const user = await requireAdmin();

  const result = await notifyUserPush(user.id, {
    title: "Testvarsel fra Loggbok",
    body: "Hvis du ser dette, fungerer push på telefonen.",
    url: "/",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.detail
        ? `Kunne ikke sende: ${result.detail}`
        : "Kunne ikke sende varsel. Sjekk OneSignal-nøkkel og at du har tillatt varsler.",
    };
  }

  return {
    ok: true,
    message:
      "Varsel sendt. Lukk appen litt — du skal få push hvis varsler er tillatt på telefonen.",
  };
}
