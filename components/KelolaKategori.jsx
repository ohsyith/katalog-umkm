"use client";

import { useState, useTransition } from "react";
import Tombol from "@/components/Tombol";
import {
  tambahKategori,
  ubahKategori,
  hapusKategori,
} from "@/app/admin/actions";

export default function KelolaKategori({ daftarKategori = [] }) {
  const [pesanError, setPesanError] = useState(null);
  const [pesanSukses, setPesanSukses] = useState(null);
  const [namaKategoriBaru, setNamaKategoriBaru] = useState("");
  const [editingKategori, setEditingKategori] = useState(null);
  const [namaEdit, setNamaEdit] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleTambah = (e) => {
    e.preventDefault();
    if (!namaKategoriBaru.trim()) return;

    setPesanError(null);
    setPesanSukses(null);

    const formData = new FormData();
    formData.append("nama", namaKategoriBaru.trim());

    startTransition(async () => {
      const res = await tambahKategori(null, formData);
      if (res?.error) {
        setPesanError(res.error);
      } else {
        setPesanSukses(`Kategori "${namaKategoriBaru.trim()}" berhasil ditambahkan.`);
        setNamaKategoriBaru("");
      }
    });
  };

  const handleMulaiUbah = (kat) => {
    setPesanError(null);
    setPesanSukses(null);
    setEditingKategori(kat.nama);
    setNamaEdit(kat.nama);
  };

  const handleSimpanUbah = (namaLama) => {
    if (!namaEdit.trim() || namaEdit.trim() === namaLama) {
      setEditingKategori(null);
      return;
    }

    setPesanError(null);
    setPesanSukses(null);

    const formData = new FormData();
    formData.append("namaLama", namaLama);
    formData.append("namaBaru", namaEdit.trim());

    startTransition(async () => {
      const res = await ubahKategori(null, formData);
      setEditingKategori(null);
      if (res?.error) {
        setPesanError(res.error);
      } else {
        setPesanSukses(`Kategori "${namaLama}" berhasil diubah menjadi "${namaEdit.trim()}".`);
      }
    });
  };

  const handleHapus = (kat) => {
    if (kat.jumlahProduk > 0) {
      setPesanError(
        `Kategori "${kat.nama}" tidak dapat dihapus karena masih digunakan oleh ${kat.jumlahProduk} produk. Silakan ubah atau hapus produk terkait terlebih dahulu.`
      );
      return;
    }

    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus kategori "${kat.nama}"?`
    );
    if (!yakin) return;

    setPesanError(null);
    setPesanSukses(null);

    startTransition(async () => {
      const res = await hapusKategori(kat.nama);
      if (res?.error) {
        setPesanError(res.error);
      } else {
        setPesanSukses(`Kategori "${kat.nama}" berhasil dihapus.`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-4 text-sm font-semibold text-bahaya">
          {pesanError}
        </div>
      )}

      {pesanSukses && (
        <div className="rounded-xl border border-utama/30 bg-utama/10 p-4 text-sm font-semibold text-utama">
          {pesanSukses}
        </div>
      )}

      {/* Form Tambah Kategori Baru */}
      <form
        onSubmit={handleTambah}
        className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-5 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <input
            type="text"
            name="nama"
            placeholder="Ketik nama kategori baru..."
            value={namaKategoriBaru}
            onChange={(e) => setNamaKategoriBaru(e.target.value)}
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            required
          />
        </div>
        <Tombol type="submit" disabled={isPending || !namaKategoriBaru.trim()}>
          {isPending ? "Menyimpan..." : "+ Tambah Kategori"}
        </Tombol>
      </form>

      {/* Tabel Kelola Kategori */}
      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="border-b border-garis bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Nama Kategori</th>
              <th className="px-5 py-3.5 font-semibold">Jumlah Produk</th>
              <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {daftarKategori.length > 0 ? (
              daftarKategori.map((kat) => (
                <tr key={kat.nama} className="hover:bg-permukaan/50 transition-colors">
                  <td className="px-5 py-3.5">
                    {editingKategori === kat.nama ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={namaEdit}
                          onChange={(e) => setNamaEdit(e.target.value)}
                          className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks focus:border-utama focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSimpanUbah(kat.nama)}
                          disabled={isPending}
                          className="rounded-lg bg-utama px-3 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKategori(null)}
                          className="rounded-lg border border-garis px-2.5 py-1.5 text-xs font-semibold text-teks hover:bg-permukaan"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-teks">{kat.nama}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-permukaan px-2.5 py-1 text-xs font-bold text-teks-lembut border border-garis">
                      {kat.jumlahProduk} produk
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleMulaiUbah(kat)}
                        disabled={isPending}
                        className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
                      >
                        Ubah Nama
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHapus(kat)}
                        disabled={isPending}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          kat.jumlahProduk > 0
                            ? "cursor-not-allowed border border-garis text-teks-lembut opacity-50"
                            : "border border-bahaya text-bahaya hover:bg-bahaya hover:text-white"
                        }`}
                        title={
                          kat.jumlahProduk > 0
                            ? "Kategori masih digunakan oleh produk"
                            : "Hapus kategori ini"
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-teks-lembut">
                  Belum ada kategori
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

