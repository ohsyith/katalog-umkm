"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTemaState] = useState("terang");
  const [mounted, setMounted] = useState(false);

  // Inisialisasi tema saat client mount
  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("tema");
      let temaAktif = "terang";
      if (tersimpan === "gelap" || tersimpan === "terang") {
        temaAktif = tersimpan;
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        temaAktif = "gelap";
      }

      setTemaState(temaAktif);
      if (temaAktif === "gelap") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Gagal membaca tema dari localStorage:", e);
    }
    setMounted(true);
  }, []);

  const setTema = (nilai) => {
    const temaBaru = nilai === "gelap" ? "gelap" : "terang";
    setTemaState(temaBaru);
    try {
      localStorage.setItem("tema", temaBaru);
    } catch (e) {
      console.error("Gagal menyimpan tema:", e);
    }

    if (temaBaru === "gelap") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTema = () => {
    setTema(tema === "gelap" ? "terang" : "gelap");
  };

  return (
    <ThemeContext.Provider value={{ tema, toggleTema, setTema, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}

