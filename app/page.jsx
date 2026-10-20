import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const kategoriDipilih = params?.kategori?.trim() || "";

  let daftarProduk = null;
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();

    // Mengambil daftar kategori unik dari tabel produk di database
    const { data: katData, error: katError } = await supabase
      .from("produk")
      .select("kategori");

    if (!katError && katData) {
      daftarKategori = Array.from(
        new Set(katData.map((p) => p.kategori).filter(Boolean))
      ).sort();
    }

    // Query daftar produk sesuai filter kategori dan pencarian nama
    let query = supabase.from("produk").select("*");

    if (kategoriDipilih) {
      query = query.eq("kategori", kategoriDipilih);
    }

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    const { data, error } = await query.order("id", { ascending: true });

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data;
    }
  } catch (err) {
    pesanError = err.message || "Gagal memuat data produk.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian */}
          <form action="/" method="GET" className="flex items-center gap-2">
            {kategoriDipilih && (
              <input type="hidden" name="kategori" value={kategoriDipilih} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-64"
            />
            <Tombol type="submit">Cari</Tombol>
            {(q || kategoriDipilih) && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </form>
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                !kategoriDipilih
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kat) => {
              const isActive =
                kategoriDipilih.toLowerCase() === kat.toLowerCase();
              const url = `/?kategori=${encodeURIComponent(kat)}${
                q ? `&q=${encodeURIComponent(q)}` : ""
              }`;
              return (
                <Link
                  key={kat}
                  href={url}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </Link>
              );
            })}
          </div>
        )}

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : daftarProduk && daftarProduk.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
        )}
      </section>
    </>
  );
}
