"use client";

import { useEffect } from "react";

/** Registers the service worker so the app is installable / PWA-capable. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Registration failures are non-fatal.
      });
    }
  }, []);

  return null;
}
