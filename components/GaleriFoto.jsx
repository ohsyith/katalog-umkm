"use client";

import { useState } from "react";

export default function GaleriFoto({ fotoUtama, fotoTambahan, nama }) {
  const daftar = [];
  if (fotoUtama) {
    daftar.push(fotoUtama);
  }

  if (Array.isArray(fotoTambahan)) {
    daftar.push(...fotoTambahan);
  } else if (typeof fotoTambahan === "string" && fotoTambahan.trim()) {
    try {
      const parsed = JSON.parse(fotoTambahan);
      if (Array.isArray(parsed)) {
        daftar.push(...parsed);
      } else {
        daftar.push(...fotoTambahan.split(",").map((s) => s.trim()));
      }
    } catch {
      daftar.push(...fotoTambahan.split(",").map((s) => s.trim()));
    }
  }

  // Hilangkan foto kosong atau duplikat dengan tetap menjaga urutan
  const semuaFoto = Array.from(new Set(daftar.filter(Boolean)));

  const [fotoAktif, setFotoAktif] = useState(semuaFoto[0] || fotoUtama || "");

  // Jika produk hanya memiliki satu foto atau tidak ada foto, tampilkan normal tanpa galeri tambahan
  if (semuaFoto.length <= 1) {
    return (
      <img
        src={fotoAktif || fotoUtama}
        alt={nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Foto utama besar */}
      <img
        src={fotoAktif}
        alt={nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />

      {/* Gambar kecil (thumbnail) di bawahnya */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {semuaFoto.map((foto, index) => {
          const isAktif = foto === fotoAktif;
          return (
            <button
              key={`${foto}-${index}`}
              type="button"
              onClick={() => setFotoAktif(foto)}
              aria-label={`Pilih foto ${index + 1}`}
              aria-current={isAktif ? "true" : undefined}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:w-20 ${
                isAktif
                  ? "border-utama ring-2 ring-utama/20"
                  : "border-garis opacity-70 hover:border-teks-lembut hover:opacity-100"
              }`}
            >
              <img
                src={foto}
                alt={`${nama} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

