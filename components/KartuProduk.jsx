import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import TambahKeKeranjangButton from "@/components/TambahKeKeranjangButton";
import TombolFavorit from "@/components/TombolFavorit";

export default function KartuProduk({ produk }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <div className="relative">
        <Link href={`/produk/${produk.id}`} className="block">
          <img
            src={produk.foto_url}
            alt={produk.nama}
            className="aspect-square w-full bg-permukaan object-cover"
          />
        </Link>
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
          <p className="mt-auto self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <TambahKeKeranjangButton produk={produk} varianTampilan="kartu" />
      </div>
    </div>
  );
}
