import Link from "next/link";
import {
  formatRupiah,
  apakahProdukHabis,
  apakahAdaDiskon,
} from "@/lib/format";
import TambahKeKeranjangButton from "@/components/TambahKeKeranjangButton";
import TombolFavorit from "@/components/TombolFavorit";

export default function KartuProduk({ produk }) {
  const isHabis = apakahProdukHabis(produk);
  const adaDiskon = apakahAdaDiskon(produk);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <div className="relative">
        <Link href={`/produk/${produk.id}`} className="block">
          <img
            src={produk.foto_url}
            alt={produk.nama}
            className={`aspect-square w-full bg-permukaan object-cover ${
              isHabis ? "grayscale-[40%] opacity-85" : ""
            }`}
          />
        </Link>

        {/* Badge Habis (US-19) atau Badge Khusus seperti Baru / Terlaris (US-20) */}
        {isHabis ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-bahaya px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            Habis
          </span>
        ) : produk.badge ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-utama px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            {produk.badge}
          </span>
        ) : null}

        <TombolFavorit
          id={produk.id}
          nama={produk.nama}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-garis bg-latar/90 shadow-sm backdrop-blur-sm hover:scale-105"
        />
      </div>

      <Link href={`/produk/${produk.id}`} className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="text-xs text-teks-lembut">{produk.kategori}</p>
          <h3 className="font-semibold leading-snug group-hover:text-utama">
            {produk.nama}
          </h3>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            {adaDiskon ? (
              <>
                <p className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                  {formatRupiah(produk.harga_diskon)}
                </p>
                <span className="text-xs text-teks-lembut line-through">
                  {formatRupiah(produk.harga)}
                </span>
              </>
            ) : (
              <p className="self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                {formatRupiah(produk.harga)}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <TambahKeKeranjangButton produk={produk} varianTampilan="kartu" />
      </div>
    </div>
  );
}
