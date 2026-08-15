"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";

/**
 * Native skall for Capacitor iOS — statusbar, splash, tilbake-knapp.
 * På vanlig web (Vercel/localhost) gjør den ingenting.
 */
export function CapacitorShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeBack: { remove: () => Promise<void> } | undefined;
    let removeKeyboard: { remove: () => Promise<void> } | undefined;

    // Statuslinja må følge telefonens lys/mørk-innstilling, ellers blir
    // klokka usynlig mot bakgrunnen når brukeren bytter modus.
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    async function syncStatusBar() {
      try {
        await StatusBar.setStyle({
          style: darkQuery.matches ? Style.Dark : Style.Light,
        });
        await StatusBar.setBackgroundColor({
          color: darkQuery.matches ? "#100f0d" : "#f5f3ef",
        });
      } catch {
        // setBackgroundColor finnes ikke på iOS — stilen er nok der
      }
    }

    darkQuery.addEventListener("change", syncStatusBar);

    void (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await syncStatusBar();
        await SplashScreen.hide();
      } catch {
        // Plugins kan mangle i web-preview
      }

      removeBack = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });

      try {
        removeKeyboard = await Keyboard.addListener("keyboardWillShow", () => {
          document.documentElement.classList.add("keyboard-open");
        });
        await Keyboard.addListener("keyboardWillHide", () => {
          document.documentElement.classList.remove("keyboard-open");
        });
      } catch {
        // Keyboard-plugin valgfri
      }
    })();

    return () => {
      darkQuery.removeEventListener("change", syncStatusBar);
      void removeBack?.remove();
      void removeKeyboard?.remove();
    };
  }, []);

  return null;
}
