"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function TombolTema() {
  const { tema, toggleTema, mounted } = useTheme();

  // Placeholder sebelum mounted di client untuk menghindari hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Pilih mode tampilan"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-teks-lembut transition-colors"
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  const isGelap = tema === "gelap";

  return (
    <button
      type="button"
      onClick={toggleTema}
      aria-label={isGelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isGelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-teks transition-colors hover:border-utama hover:text-utama"
    >
      {isGelap ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-5 w-5 text-amber-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-5 w-5 text-teks-lembut transition-colors hover:text-utama"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </button>
  );
}

