"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Baca data keranjang dari localStorage saat client mount (hindari hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("keranjang");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Gagal memuat keranjang dari localStorage:", e);
    }
    setMounted(true);
  }, []);

  // Simpan perubahan ke localStorage setiap kali items berubah (setelah mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("keranjang", JSON.stringify(items));
    } catch (e) {
      console.error("Gagal menyimpan keranjang ke localStorage:", e);
    }
  }, [items, mounted]);

  const tambahKeKeranjang = (itemBaru) => {
    const key = `${itemBaru.id}-${itemBaru.varian || "default"}`;
    const jumlahDitambah = Math.max(1, Number(itemBaru.jumlah) || 1);
    const hargaItem = Number(itemBaru.harga) || 0;

    setItems((prevItems) => {
      const index = prevItems.findIndex((it) => it.key === key);
      if (index > -1) {
        const updated = [...prevItems];
        updated[index] = {
          ...updated[index],
          jumlah: updated[index].jumlah + jumlahDitambah,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          id: itemBaru.id,
          key,
          nama: itemBaru.nama,
          harga: hargaItem,
          foto_url: itemBaru.foto_url || "",
          jumlah: jumlahDitambah,
          varian: itemBaru.varian || null,
        },
      ];
    });
  };

  const ubahJumlah = (key, jumlahBaru) => {
    const jumlah = Number(jumlahBaru);
    if (jumlah <= 0) {
      hapusItem(key);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((it) => (it.key === key ? { ...it, jumlah } : it))
    );
  };

  const hapusItem = (key) => {
    setItems((prevItems) => prevItems.filter((it) => it.key !== key));
  };

  const kosongkanKeranjang = () => {
    setItems([]);
  };

  const totalItem = items.reduce(
    (sum, item) => sum + (Number(item.jumlah) || 0),
    0
  );

  const totalHarga = items.reduce(
    (sum, item) => sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        mounted,
        tambahKeKeranjang,
        ubahJumlah,
        hapusItem,
        kosongkanKeranjang,
        totalItem,
        totalHarga,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
}

