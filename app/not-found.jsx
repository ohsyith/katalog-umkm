import Link from "next/link";

export default function HalamanTidakDitemukan() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-garis bg-permukaan text-3xl font-black text-utama shadow-sm">
        404
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-3 text-base leading-relaxed text-teks-lembut">
        Maaf, produk atau halaman yang kamu cari tidak ada, sudah dipindahkan, atau telah dihapus.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-utama px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-utama-gelap"
        >
          <span>← Kembali ke Katalog</span>
        </Link>
        <Link
          href="/tentang"
          className="inline-flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-6 py-3 font-semibold text-teks transition-colors hover:border-utama hover:bg-latar hover:text-utama"
        >
          Hubungi Toko
        </Link>
      </div>
    </div>
  );
}
