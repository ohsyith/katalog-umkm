"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost")
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("Gagal mendaftarkan Service Worker:", err));
    }
  }, []);

  return null;
}

