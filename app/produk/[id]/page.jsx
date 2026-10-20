import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import PilihanPesanan from "@/components/PilihanPesanan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBagikan from "@/components/TombolBagikan";
import {
  formatRupiah,
  apakahProdukHabis,
  apakahAdaDiskon,
  apakahProdukAktif,
} from "@/lib/format";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: produk } = await supabase
    .from("produk")
    .select("nama, deskripsi, foto_url")
    .eq("id", id)
    .maybeSingle();

  if (!produk || !apakahProdukAktif(produk)) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  // Bersihkan tag teknis kurung siku [diskon: ...], [baru], dsb. dari deskripsi publik (US-26)
  const deskripsiBersih = produk.deskripsi
    ? produk.deskripsi.replace(/\[.*?\]/g, "").trim()
    : `Beli ${produk.nama} kualitas terbaik di ${toko.nama}.`;

  const judul = `${produk.nama} - ${toko.nama}`;
  const foto = produk.foto_url || undefined;

  return {
    title: judul,
    description: deskripsiBersih,
    openGraph: {
      title: judul,
      description: deskripsiBersih,
      type: "website",
      images: foto ? [{ url: foto, alt: produk.nama }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsiBersih,
      images: foto ? [foto] : [],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk || !apakahProdukAktif(produk)) {
    notFound();
  }

  const isHabis = apakahProdukHabis(produk);
  const adaDiskon = apakahAdaDiskon(produk);

  // Ambil produk terkait dari kategori yang sama, mengecualikan produk yang sedang dibuka (US-17)
  let produkTerkait = [];
  if (produk.kategori) {
    const { data: terkait } = await supabase
      .from("produk")
      .select("*")
      .eq("kategori", produk.kategori)
      .neq("id", produk.id)
      .order("id", { ascending: true })
      .limit(4);

    if (terkait && terkait.length > 0) {
      produkTerkait = terkait;
    }
  }

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriFoto
          key={produk.id}
          fotoUtama={produk.foto_url}
          fotoTambahan={produk.foto_tambahan}
          nama={produk.nama}
        />
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
          >
            Kembali ke katalog
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            {/* Status stok (US-19) atau badge seperti Baru / Terlaris (US-20) */}
            {isHabis ? (
              <span className="rounded-full bg-bahaya px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                Habis
              </span>
            ) : produk.badge ? (
              <span className="rounded-full bg-utama px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                {produk.badge}
              </span>
            ) : null}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
              {produk.nama}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <TombolBagikan
                nama={produk.nama}
                deskripsi={produk.deskripsi}
              />
              <TombolFavorit
                id={produk.id}
                nama={produk.nama}
                ukuran="lg"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-garis bg-permukaan hover:border-utama hover:bg-latar"
              />
            </div>
          </div>

          {/* Harga normal atau harga diskon (US-20) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {adaDiskon ? (
              <>
                <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
                  {formatRupiah(produk.harga_diskon)}
                </p>
                <span className="text-base text-teks-lembut line-through">
                  {formatRupiah(produk.harga)}
                </span>
              </>
            ) : (
              <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
                {formatRupiah(produk.harga)}
              </p>
            )}
          </div>

          <p className="max-w-prose leading-relaxed text-teks-lembut">
            {produk.deskripsi}
          </p>

          <PilihanPesanan produk={produk} />
        </div>
      </article>

      {produkTerkait.length > 0 && (
        <section
          aria-labelledby="judul-terkait"
          className="flex flex-col gap-6 border-t border-garis py-8 sm:py-12"
        >
          <h2 id="judul-terkait" className="text-2xl font-bold">
            Produk terkait
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
