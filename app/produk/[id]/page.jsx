import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import PilihanPesanan from "@/components/PilihanPesanan";
import TombolFavorit from "@/components/TombolFavorit";
import { formatRupiah } from "@/lib/format";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

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
          <p className="text-sm text-teks-lembut">{produk.kategori}</p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
              {produk.nama}
            </h1>
            <TombolFavorit
              id={produk.id}
              nama={produk.nama}
              ukuran="lg"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-garis bg-permukaan hover:border-utama hover:bg-latar"
            />
          </div>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
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
