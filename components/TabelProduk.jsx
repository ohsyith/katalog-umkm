"use client";

import { useState, useTransition } from "react";
import { formatRupiah, apakahProdukAktif } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk, toggleStatusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk }) {
  const [pesanError, setPesanError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleStatus = (produk) => {
    setPesanError(null);
    setTogglingId(produk.id);
    startTransition(async () => {
      const res = await toggleStatusProduk(produk.id);
      setTogglingId(null);
      if (res?.error) {
        setPesanError(res.error);
      }
    });
  };

  const handleHapus = (produk) => {
    const yakin = window.confirm(
      `Apakah kamu yakin ingin menghapus produk "${produk.nama}"?`
    );
    if (!yakin) return;

    setPesanError(null);
    setDeletingId(produk.id);
    startTransition(async () => {
      const res = await hapusProduk(produk.id);
      setDeletingId(null);
      if (res?.error) {
        setPesanError(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {pesanError && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-3.5 text-sm font-semibold text-bahaya">
          {pesanError}
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-garis bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Produk</th>
              <th className="px-4 py-3.5 font-semibold">Kategori</th>
              <th className="px-4 py-3.5 font-semibold">Harga</th>
              <th className="px-4 py-3.5 font-semibold">Status (US-32)</th>
              <th className="px-4 py-3.5 text-right font-semibold">
                <span>Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-garis">
            {daftarProduk.map((produk) => {
              const isAktif = apakahProdukAktif(produk);
              const isToggling = isPending && togglingId === produk.id;
              const isDeleting = isPending && deletingId === produk.id;

              return (
                <tr
                  key={produk.id}
                  className={`transition-colors hover:bg-permukaan/40 ${
                    !isAktif ? "bg-permukaan/20 opacity-80" : ""
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={produk.foto_url}
                        alt=""
                        className="h-11 w-11 rounded-lg object-cover bg-permukaan border border-garis"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-teks">{produk.nama}</span>
                        {!isAktif && (
                          <span className="text-xs text-bahaya font-medium">
                            Disembunyikan dari katalog
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-teks-lembut">
                    {produk.kategori || "-"}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-teks">
                    {formatRupiah(produk.harga)}
                  </td>
                  <td className="px-4 py-3.5">
                    {/* Tombol Toggle Status Aktif / Nonaktif (US-32) */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleStatus(produk)}
                      aria-label={
                        isAktif
                          ? `Nonaktifkan ${produk.nama}`
                          : `Aktifkan ${produk.nama}`
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-sm ${
                        isAktif
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-garis text-teks-lembut border border-garis hover:bg-garis/80"
                      } ${isToggling ? "cursor-wait opacity-50" : ""}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isAktif ? "bg-emerald-500 dark:bg-emerald-400" : "bg-teks-lembut"
                        }`}
                      />
                      <span>
                        {isToggling
                          ? "Memproses..."
                          : isAktif
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                        Ubah
                      </Tombol>
                      <Tombol
                        type="button"
                        varian="bahaya"
                        disabled={isDeleting}
                        onClick={() => handleHapus(produk)}
                      >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                      </Tombol>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
