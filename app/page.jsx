import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";
import { apakahProdukAktif } from "@/lib/format";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const kategoriDipilih = params?.kategori?.trim() || "";
  const urut = params?.urut?.trim() || "";

  const BATAS_PER_HALAMAN = 8;
  const halamanInput = parseInt(params?.halaman, 10);
  let halaman = isNaN(halamanInput) || halamanInput < 1 ? 1 : halamanInput;

  // Helper untuk membangun URL dengan parameter yang saling terhubung (US-11, US-15, US-16)
  function buildUrl({ newKat, newQ, newUrut, newHalaman }) {
    const p = new URLSearchParams();
    const k = newKat !== undefined ? newKat : kategoriDipilih;
    const queryText = newQ !== undefined ? newQ : q;
    const u = newUrut !== undefined ? newUrut : urut;
    const h = newHalaman !== undefined ? newHalaman : halaman;

    if (k) p.set("kategori", k);
    if (queryText) p.set("q", queryText);
    if (u) p.set("urut", u);
    if (h && h > 1) p.set("halaman", String(h));

    const s = p.toString();
    return s ? `/?${s}` : "/";
  }

  let daftarProduk = null;
  let daftarKategori = [];
  let pesanError = null;
  let totalHalaman = 1;

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

    // Query daftar produk sesuai filter kategori, pencarian, dan urutan di database dengan range paginasi (US-16)
    // Saring keluar produk nonaktif agar tidak muncul di katalog publik (US-32)
    let query = supabase
      .from("produk")
      .select("*", { count: "exact" })
      .not("deskripsi", "ilike", "%[nonaktif]%");

    if (kategoriDipilih) {
      query = query.eq("kategori", kategoriDipilih);
    }

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    // Terapkan urutan pada query Supabase di sisi server
    if (urut === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urut === "termahal") {
      query = query.order("harga", { ascending: false });
    } else if (urut === "terbaru") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("id", { ascending: true });
    }

    const dari = (halaman - 1) * BATAS_PER_HALAMAN;
    const sampai = dari + BATAS_PER_HALAMAN - 1;

    let { data, count, error } = await query.range(dari, sampai);

    const totalProduk = count || 0;
    totalHalaman = Math.ceil(totalProduk / BATAS_PER_HALAMAN) || 1;

    // Jika halaman melebihi jumlah halaman, tampilkan halaman terakhir
    if (halaman > totalHalaman && totalProduk > 0) {
      halaman = totalHalaman;
      const dariTerakhir = (halaman - 1) * BATAS_PER_HALAMAN;
      const sampaiTerakhir = dariTerakhir + BATAS_PER_HALAMAN - 1;
      const res = await query.range(dariTerakhir, sampaiTerakhir);
      data = res.data;
      error = res.error;
    }

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = (data || []).filter((p) => apakahProdukAktif(p));
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

          {/* Form Pencarian (US-11) */}
          <form action="/" method="GET" className="flex items-center gap-2">
            {kategoriDipilih && (
              <input type="hidden" name="kategori" value={kategoriDipilih} />
            )}
            {urut && <input type="hidden" name="urut" value={urut} />}
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-64"
            />
            <Tombol type="submit">Cari</Tombol>
            {(q || kategoriDipilih || urut || halaman > 1) && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </form>
        </div>

        {/* Filter Kategori (US-11) */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-teks-lembut">Kategori:</span>
            <Link
              href={buildUrl({ newKat: "", newHalaman: 1 })}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
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
              return (
                <Link
                  key={kat}
                  href={buildUrl({ newKat: kat, newHalaman: 1 })}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
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

        {/* Pilihan Urutan Produk (US-15) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-teks-lembut">Urutan:</span>
          <Link
            href={buildUrl({ newUrut: "termurah", newHalaman: 1 })}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              urut === "termurah"
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
            }`}
          >
            Termurah
          </Link>
          <Link
            href={buildUrl({ newUrut: "termahal", newHalaman: 1 })}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              urut === "termahal"
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
            }`}
          >
            Termahal
          </Link>
          <Link
            href={buildUrl({ newUrut: "terbaru", newHalaman: 1 })}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              urut === "terbaru"
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
            }`}
          >
            Terbaru
          </Link>
        </div>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : daftarProduk && daftarProduk.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            {/* Navigasi Paginasi (US-16) */}
            {totalHalaman > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                <Link
                  href={buildUrl({ newHalaman: halaman - 1 })}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    halaman <= 1
                      ? "pointer-events-none opacity-40 border border-garis bg-latar text-teks-lembut"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                  aria-disabled={halaman <= 1}
                >
                  Sebelumnya
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((nomor) => (
                    <Link
                      key={nomor}
                      href={buildUrl({ newHalaman: nomor })}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                        nomor === halaman
                          ? "bg-utama text-white"
                          : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                      }`}
                    >
                      {nomor}
                    </Link>
                  ))}
                </div>

                <Link
                  href={buildUrl({ newHalaman: halaman + 1 })}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    halaman >= totalHalaman
                      ? "pointer-events-none opacity-40 border border-garis bg-latar text-teks-lembut"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                  aria-disabled={halaman >= totalHalaman}
                >
                  Berikutnya
                </Link>
              </div>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
        )}
      </section>
    </>
  );
}
