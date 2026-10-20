"use client";

import { useState, useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({
  produk = {},
  labelTombol,
  action,
  error: customError,
}) {
  const [state, formAction, isPending] = useActionState(
    action || (() => null),
    null
  );
  const errorMessage = customError || state?.error;

  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);

  const handleBuatDeskripsiAI = async (e) => {
    const form = e.currentTarget.closest("form");
    const nama = form?.nama?.value?.trim();
    const kategori = form?.kategori?.value?.trim();

    if (!nama) {
      setAiError("Isi nama produk terlebih dahulu sebelum membuat deskripsi.");
      return;
    }

    setAiError(null);
    setIsGeneratingAI(true);

    try {
      const res = await buatDeskripsiAI(nama, kategori);
      if (res?.error) {
        setAiError(res.error);
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
      }
    } catch (err) {
      setAiError(err.message || "Gagal membuat deskripsi dengan AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {errorMessage && (
        <p className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {errorMessage}
        </p>
      )}
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      {/* Kolom Deskripsi dengan tombol Buat deskripsi dengan AI (US-14) */}
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <div className="flex items-center justify-between">
          <label htmlFor="deskripsi">Deskripsi</label>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={isGeneratingAI}
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-3 py-1 text-xs font-semibold text-utama transition-colors hover:border-utama hover:bg-latar disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGeneratingAI ? "Sedang membuat..." : "Buat deskripsi dengan AI"}
          </button>
        </div>
        {aiError && (
          <p className="text-xs font-normal text-bahaya">{aiError}</p>
        )}
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
