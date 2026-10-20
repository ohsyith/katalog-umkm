"use client";

import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/components/FavoritProvider";

export default function DaftarFavorit({ semuaProduk = [], error = null }) {
  const { isFavorit, mounted, jumlahFavorit } = useFavorit();

  // Filter produk dari database yang ada di daftar favorit client (US-24)
  const produkFavorit = mounted
    ? semuaProduk.filter((p) => isFavorit(p.id))
    : [];

  return (
    <div className="flex flex-col gap-6 py-8 sm:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
          Produk Favorit
        </h1>
        <p className="text-sm text-teks-lembut">
          {mounted && jumlahFavorit > 0
            ? `${produkFavorit.length} produk tersimpan di favorit kamu`
            : "Daftar produk yang telah kamu tandai"}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm font-semibold text-bahaya">
          {error}
        </div>
      )}

      {!mounted || produkFavorit.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center sm:py-24">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-permukaan text-teks-lembut">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-10 w-10 text-teks-lembut"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-teks">
            Belum ada produk favorit
          </h2>
          <p className="max-w-md text-sm text-teks-lembut">
            Kamu belum menandai produk favorit apa pun. Klik ikon hati pada produk di katalog untuk menyimpannya di sini.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-utama px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkFavorit.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

