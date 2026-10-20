"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function HalamanKeranjang() {
  const {
    items,
    mounted,
    ubahJumlah,
    hapusItem,
    kosongkanKeranjang,
    totalItem,
    totalHarga,
  } = useCart();

  // Saat belum mount di client (SSR), tampilkan keranjang kosong agar tidak hydration mismatch
  if (!mounted || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center sm:py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-permukaan text-teks-lembut">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.926-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-teks">
          Keranjang belanja masih kosong
        </h1>
        <p className="max-w-md text-sm text-teks-lembut">
          Kamu belum menambahkan produk apa pun ke keranjang. Jelajahi katalog kami
          dan temukan produk favoritmu.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-utama px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  // Format pesan WhatsApp yang memuat seluruh item di keranjang
  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const barisPesanan = items.map((item, index) => {
    const varianText = item.varian ? ` (${item.varian})` : "";
    const subtotalText = formatRupiah(item.harga * item.jumlah);
    return `${index + 1}. ${item.nama}${varianText} x${item.jumlah} - ${subtotalText}`;
  });

  const pesanWhatsApp = `Halo, saya mau pesan:\n${barisPesanan.join("\n")}\nTotal: ${formatRupiah(totalHarga)}`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesanWhatsApp)}`;

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
            Keranjang Belanja
          </h1>
          <p className="mt-1 text-sm text-teks-lembut">
            {totalItem} produk di keranjang belanja
          </p>
        </div>
        <button
          type="button"
          onClick={kosongkanKeranjang}
          className="self-start text-xs font-semibold text-bahaya underline underline-offset-4 hover:opacity-80 sm:self-auto"
        >
          Kosongkan keranjang
        </button>
      </div>

      {/* Daftar Item Keranjang */}
      <div className="flex flex-col divide-y divide-garis overflow-hidden rounded-2xl border border-garis bg-latar">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            {/* Foto dan Info Produk */}
            <div className="flex items-center gap-4">
              <img
                src={item.foto_url || "/produk/kopi.svg"}
                alt={item.nama}
                className="h-16 w-16 shrink-0 rounded-xl border border-garis bg-permukaan object-cover sm:h-20 sm:w-20"
              />
              <div className="flex flex-col gap-1">
                <Link
                  href={`/produk/${item.id}`}
                  className="font-bold text-teks hover:text-utama"
                >
                  {item.nama}
                </Link>
                {item.varian && (
                  <span className="text-xs text-teks-lembut">
                    Varian: <span className="font-medium text-teks">{item.varian}</span>
                  </span>
                )}
                <span className="text-xs text-teks-lembut sm:hidden">
                  Harga: {formatRupiah(item.harga)}
                </span>
              </div>
            </div>

            {/* Kontrol Jumlah, Subtotal, dan Hapus */}
            <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
              <span className="hidden text-sm font-semibold text-teks-lembut sm:inline">
                {formatRupiah(item.harga)}
              </span>

              {/* Kontrol Jumlah */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ubahJumlah(item.key, item.jumlah - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-base font-bold text-teks hover:border-utama hover:text-utama"
                  aria-label="Kurangi jumlah"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-sm font-bold text-teks">
                  {item.jumlah}
                </span>
                <button
                  type="button"
                  onClick={() => ubahJumlah(item.key, item.jumlah + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-latar text-base font-bold text-teks hover:border-utama hover:text-utama"
                  aria-label="Tambah jumlah"
                >
                  +
                </button>
              </div>

              {/* Subtotal Per Baris */}
              <span className="min-w-24 text-right font-bold text-teks">
                {formatRupiah(item.harga * item.jumlah)}
              </span>

              {/* Tombol Hapus */}
              <button
                type="button"
                onClick={() => hapusItem(item.key)}
                className="text-xs font-semibold text-bahaya underline underline-offset-4 hover:opacity-80"
                aria-label={`Hapus ${item.nama}`}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bagian Ringkasan & Tombol Checkout WhatsApp */}
      <div className="flex flex-col gap-6 rounded-2xl border border-garis bg-permukaan p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-teks-lembut">Total belanja:</span>
          <span className="text-3xl font-extrabold text-harga">
            {formatRupiah(totalHarga)}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-5 py-3 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
          >
            Lanjut Belanja
          </Link>
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-utama px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-utama-gelap"
          >
            Pesan via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

