"use client";

import { useState, useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  daftarKategori = [],
  labelTombol,
  action,
  error: customError,
}) {
  const [state, formAction, isPending] = useActionState(
    action || (() => null),
    null
  );

  const errorMessage = customError || state?.error;
  const fieldErrors = state?.errors || {};
  const currentValues = state?.values || {};

  const namaDefault = currentValues.nama !== undefined ? currentValues.nama : (produk.nama || "");
  const hargaDefault = currentValues.harga !== undefined ? currentValues.harga : (produk.harga ?? "");
  const kategoriDefault = currentValues.kategori !== undefined ? currentValues.kategori : (produk.kategori || "");
  const fotoUrlDefault = currentValues.foto_url !== undefined ? currentValues.foto_url : (produk.foto_url || "");
  const fotoTambahanDefault = currentValues.foto_tambahan !== undefined
    ? currentValues.foto_tambahan
    : Array.isArray(produk.foto_tambahan)
    ? produk.foto_tambahan.join("\n")
    : typeof produk.foto_tambahan === "string"
    ? produk.foto_tambahan
    : "";

  const [deskripsi, setDeskripsi] = useState(
    currentValues.deskripsi !== undefined ? currentValues.deskripsi : (produk.deskripsi || "")
  );
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
    <form action={formAction} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
      {errorMessage && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-3.5 text-sm font-semibold text-bahaya">
          {errorMessage}
        </div>
      )}

      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      {/* Field Nama Produk dengan validasi per field (US-34) */}
      <div className="flex flex-col gap-1">
        <Input
          label="Nama produk"
          name="nama"
          defaultValue={namaDefault}
          className={fieldErrors.nama ? "border-bahaya focus:border-bahaya" : ""}
          required
        />
        {fieldErrors.nama && (
          <p className="text-xs font-semibold text-bahaya">{fieldErrors.nama}</p>
        )}
      </div>

      {/* Field Harga dengan validasi per field (US-34) */}
      <div className="flex flex-col gap-1">
        <Input
          label="Harga (Rp)"
          name="harga"
          type="number"
          min="0"
          defaultValue={hargaDefault}
          className={fieldErrors.harga ? "border-bahaya focus:border-bahaya" : ""}
          required
        />
        {fieldErrors.harga && (
          <p className="text-xs font-semibold text-bahaya">{fieldErrors.harga}</p>
        )}
      </div>

      {/* Field Kategori dengan daftar pilihan dinamis (US-31) */}
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <label htmlFor="kategori">Kategori</label>
        <div className="flex flex-col gap-2">
          {daftarKategori.length > 0 && (
            <select
              id="kategori-pilih"
              defaultValue={kategoriDefault}
              onChange={(e) => {
                const targetInput = document.getElementById("kategori");
                if (targetInput && e.target.value) {
                  targetInput.value = e.target.value;
                }
              }}
              className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
            >
              <option value="">-- Pilih dari kategori yang ada --</option>
              {daftarKategori.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          )}
          <input
            id="kategori"
            type="text"
            name="kategori"
            placeholder="Ketik kategori atau pilih di atas..."
            defaultValue={kategoriDefault}
            className="rounded-lg border border-garis bg-latar px-3 py-2 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>
      </div>

      {/* Foto utama: input file (prioritas) + URL manual sebagai opsi (US-29) */}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Unggah foto utama (opsional)
          <input
            type="file"
            name="foto_file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teks hover:file:bg-garis"
          />
        </label>
        <p className="text-xs font-normal text-teks-lembut">
          Atau isi URL manual di bawah. Jika keduanya diisi, file yang diunggah akan diprioritaskan.
        </p>
        <Input
          label="Link foto (URL manual)"
          name="foto_url"
          placeholder="https://... atau /produk/nama-file.svg"
          defaultValue={fotoUrlDefault}
        />
      </div>

      {/* Foto tambahan: input file multiple + URL manual (US-18 + US-29) */}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Unggah foto tambahan (opsional, bisa lebih dari satu)
          <input
            type="file"
            name="foto_tambahan_files"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teks hover:file:bg-garis"
          />
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-semibold">
          <label htmlFor="foto_tambahan">
            Atau URL foto tambahan (satu per baris)
          </label>
          <textarea
            id="foto_tambahan"
            name="foto_tambahan"
            rows={3}
            placeholder={"https://example.com/foto1.jpg\n/produk/keripik.svg"}
            defaultValue={fotoTambahanDefault}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>
      </div>

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

      <div className="flex gap-3 pt-2">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
