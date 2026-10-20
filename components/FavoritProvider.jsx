"use client";

import { createContext, useContext, useState, useEffect } from "react";

const FavoritContext = createContext(null);

export function FavoritProvider({ children }) {
  const [daftarIdFavorit, setDaftarIdFavorit] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Baca daftar ID favorit dari localStorage saat client mount (mencegah hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("favorit");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setDaftarIdFavorit(parsed.map((id) => String(id)));
        }
      }
    } catch (e) {
      console.error("Gagal memuat favorit dari localStorage:", e);
    }
    setMounted(true);
  }, []);

  // Simpan perubahan ke localStorage setiap kali daftarIdFavorit berubah (setelah mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("favorit", JSON.stringify(daftarIdFavorit));
    } catch (e) {
      console.error("Gagal menyimpan favorit ke localStorage:", e);
    }
  }, [daftarIdFavorit, mounted]);

  const toggleFavorit = (id) => {
    if (!id) return;
    const stringId = String(id);
    setDaftarIdFavorit((prev) => {
      if (prev.includes(stringId)) {
        return prev.filter((item) => item !== stringId);
      } else {
        return [...prev, stringId];
      }
    });
  };

  const isFavorit = (id) => {
    if (!id) return false;
    return daftarIdFavorit.includes(String(id));
  };

  const jumlahFavorit = daftarIdFavorit.length;

  return (
    <FavoritContext.Provider
      value={{
        daftarIdFavorit,
        mounted,
        toggleFavorit,
        isFavorit,
        jumlahFavorit,
      }}
    >
      {children}
    </FavoritContext.Provider>
  );
}

export function useFavorit() {
  const context = useContext(FavoritContext);
  if (!context) {
    throw new Error("useFavorit harus digunakan di dalam FavoritProvider");
  }
  return context;
}

