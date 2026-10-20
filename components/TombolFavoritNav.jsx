"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavoritNav() {
  const { jumlahFavorit, mounted } = useFavorit();
  const count = mounted ? jumlahFavorit : 0;

  return (
    <Link
      href="/favorit"
      className="relative inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label="Lihat produk favorit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={count > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={count > 0 ? "0" : "2"}
        className={`h-5 w-5 ${count > 0 ? "text-red-500" : "text-teks-lembut"}`}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
        />
      </svg>
      <span className="hidden sm:inline">Favorit</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

