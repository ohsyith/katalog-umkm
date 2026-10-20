"use client";

import { useState, useRef } from "react";

export default function TombolBagikan({ nama, deskripsi, url, className = "" }) {
  const [feedback, setFeedback] = useState("");
  const timerRef = useRef(null);

  const tampilkanFeedback = (teks) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback(teks);
    timerRef.current = setTimeout(() => {
      setFeedback("");
    }, 2500);
  };

  const handleBagikan = async () => {
    const urlBerbagi = url || (typeof window !== "undefined" ? window.location.href : "");
    const dataShare = {
      title: nama || "Produk UMKM",
      text: deskripsi ? `${nama} - ${deskripsi.slice(0, 120)}` : nama,
      url: urlBerbagi,
    };

    // 1. Coba Web Share API (cocok untuk HP / mobile browser)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(dataShare);
        tampilkanFeedback("Berhasil dibagikan!");
        return;
      } catch (err) {
        // Jika pengguna membatalkan dialog share (AbortError), abaikan tanpa error
        if (err?.name === "AbortError") {
          return;
        }
        // Jika error lain, lanjut ke fallback clipboard di bawah
      }
    }

    // 2. Fallback: Salin ke Clipboard
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(urlBerbagi);
        tampilkanFeedback("Link tersalin!");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = urlBerbagi;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        tampilkanFeedback("Link tersalin!");
      }
    } catch {
      tampilkanFeedback("Gagal menyalin link");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBagikan}
      aria-label="Bagikan produk atau salin link"
      className={`inline-flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-4 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:bg-latar hover:text-utama ${className}`}
    >
      {feedback ? (
        <>
          <svg
            className="h-4 w-4 text-utama"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-utama">{feedback}</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Bagikan</span>
        </>
      )}
    </button>
  );
}

