"use client";

import { useState } from "react";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TambahKeKeranjangButton from "@/components/TambahKeKeranjangButton";
import { apakahProdukHabis } from "@/lib/format";

export default function PilihanPesanan({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const isHabis = apakahProdukHabis(produk);

  let daftarVarian = [];
  if (produk?.varian) {
    if (Array.isArray(produk.varian)) {
      daftarVarian = produk.varian;
    } else if (typeof produk.varian === "string") {
      try {
        const parsed = JSON.parse(produk.varian);
        if (Array.isArray(parsed)) {
          daftarVarian = parsed;
        } else {
          daftarVarian = produk.varian
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        }
      } catch {
        daftarVarian = produk.varian
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
    }
  }

  const [varian, setVarian] = useState(daftarVarian[0] || null);

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Peringatan stok habis jika habis */}
      {isHabis && (
        <div className="rounded-lg border border-bahaya/30 bg-bahaya/10 p-3 text-sm font-semibold text-bahaya">
          Stok produk ini sedang habis. Pemesanan sementara tidak tersedia.
        </div>
      )}

      {/* Pilihan varian jika ada di data produk */}
      {daftarVarian.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-teks">Pilih Varian</label>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((v) => (
              <button
                key={v}
                type="button"
                disabled={isHabis}
                onClick={() => setVarian(v)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  varian === v
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                } ${isHabis ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pilihan jumlah produk */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-teks">Jumlah</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            disabled={isHabis || jumlah <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold text-teks hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          <span className="min-w-8 text-center text-base font-bold text-teks">
            {jumlah}
          </span>
          <button
            type="button"
            onClick={() => setJumlah((prev) => prev + 1)}
            disabled={isHabis}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold text-teks hover:border-utama hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TambahKeKeranjangButton
          produk={produk}
          jumlah={jumlah}
          varian={varian}
          varianTampilan="standar"
        />
        <TombolWhatsApp produk={produk} jumlah={jumlah} varian={varian} />
      </div>
    </div>
  );
}
