"use client";

import { useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import { ONESIGNAL_APP_ID } from "@/lib/onesignal-config";
import { solidActionClass } from "@/lib/ui";

const DIALOG_SHOWN_KEY = "onesignal-integration-dialog-shown";

function isLocalOrigin(origin: string): boolean {
  return (
    origin.startsWith("http://localhost") ||
    origin.startsWith("https://localhost") ||
    origin.startsWith("http://127.0.0.1") ||
    origin.startsWith("https://127.0.0.1")
  );
}

/**
 * Initialiserer OneSignal Web SDK én gang i nettleseren.
 * react-onesignal er den sentrale, typede inngangen — ingen ekstra wrapper.
 *
 * Merk: Denne OneSignal-appen er konfigurert med Site URL =
 * https://loggbok-nm-lyart.vercel.app — init på localhost blir avvist
 * av SDK-et. Push testes derfor på produksjon (eller egen localhost-app).
 */
export function OneSignalInit({
  externalUserId,
}: {
  externalUserId?: string | null;
}) {
  const started = useRef(false);
  const [ready, setReady] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function init() {
      if (typeof window === "undefined") return;

      // Produksjons-appen godtar ikke localhost — ikke init, så unngår Qe-feil
      if (isLocalOrigin(window.location.origin)) {
        console.info(
          "OneSignal: hoppes over på localhost (Site URL er produksjon).",
        );
        return;
      }

      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });
      } catch (error) {
        console.error("OneSignal init feilet:", error);
        return;
      }

      if (cancelled) return;
      setReady(true);

      // Bekreftelsesdialog én gang etter at SDK er klar (web: før tillatelse)
      if (!sessionStorage.getItem(DIALOG_SHOWN_KEY)) {
        sessionStorage.setItem(DIALOG_SHOWN_KEY, "1");
        setShowDialog(true);
      }

      // På web er id undefined inntil server-tildelt UUID finnes
      const onChange = () => {
        const id = OneSignal.User.PushSubscription.id;
        if (id) {
          console.log("OneSignal push subscription registered:", id);
        }
      };
      OneSignal.User.PushSubscription.addEventListener("change", onChange);
      onChange();
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Koble innlogget bruker først når SDK faktisk er klar
  useEffect(() => {
    if (!ready || !externalUserId) return;
    void OneSignal.login(externalUserId).catch((error) => {
      console.error("OneSignal login feilet:", error);
    });
  }, [ready, externalUserId]);

  if (!showDialog) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onesignal-dialog-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-900/40 p-4 sm:items-center"
    >
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-lift">
        <h2
          id="onesignal-dialog-title"
          className="text-heading text-navy-900"
        >
          Your OneSignal SDK integration is complete!
        </h2>
        <p className="mt-2 text-body text-navy-700">
          You can now send Push Notifications &amp; In-App Messages through
          OneSignal. Tap below to enable push notifications.
        </p>
        <button
          type="button"
          className={`mt-5 min-h-14 w-full rounded-md px-4 text-body font-semibold ${solidActionClass}`}
          onClick={() => {
            setShowDialog(false);
            void OneSignal.Notifications.requestPermission();
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
