"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { apakahProdukHabis, ambilHargaEfektif } from "@/lib/format";

export default function TambahKeKeranjangButton({
  produk,
  jumlah = 1,
  varian = null,
  varianTampilan = "standar",
  className = "",
}) {
  const { tambahKeKeranjang } = useCart();
  const [sukses, setSukses] = useState(false);

  // Periksa apakah produk habis (US-19)
  const isHabis = apakahProdukHabis(produk);

  const handleTambah = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHabis) return;

    tambahKeKeranjang({
      id: produk.id,
      nama: produk.nama,
      harga: ambilHargaEfektif(produk),
      foto_url: produk.foto_url,
      jumlah: Number(jumlah) || 1,
      varian: varian || null,
    });

    setSukses(true);
    setTimeout(() => {
      setSukses(false);
    }, 1500);
  };

  if (varianTampilan === "kartu") {
    return (
      <button
        type="button"
        onClick={handleTambah}
        disabled={isHabis}
        aria-label={isHabis ? "Stok habis" : `Tambah ${produk.nama} ke keranjang`}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all ${
          isHabis
            ? "cursor-not-allowed border border-garis bg-permukaan text-teks-lembut opacity-50"
            : sukses
            ? "border border-utama bg-utama text-white"
            : "border border-garis bg-permukaan text-teks hover:border-utama hover:bg-latar hover:text-utama"
        } ${className}`}
      >
        {isHabis ? "Stok habis" : sukses ? "Ditambahkan ✓" : "+ Keranjang"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleTambah}
      disabled={isHabis}
      aria-label={isHabis ? "Stok habis" : `Tambah ${produk.nama} ke keranjang`}
      className={`inline-flex w-full items-center justify-center rounded-lg border-2 border-utama px-5 py-3 font-semibold transition-all sm:w-auto ${
        isHabis
          ? "cursor-not-allowed border-garis bg-permukaan text-teks-lembut opacity-50"
          : sukses
          ? "bg-utama text-white"
          : "bg-latar text-utama hover:bg-permukaan"
      } ${className}`}
    >
      {isHabis ? "Stok habis" : sukses ? "Ditambahkan ke Keranjang ✓" : "+ Tambah ke Keranjang"}
    </button>
  );
}
