"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function TombolKeranjangNav() {
  const { totalItem, mounted } = useCart();
  const count = mounted ? totalItem : 0;

  return (
    <Link
      href="/keranjang"
      className="relative inline-flex items-center gap-2 rounded-lg border border-garis bg-latar px-3.5 py-1.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label="Lihat keranjang belanja"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.75"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.926-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      <span>Keranjang</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

