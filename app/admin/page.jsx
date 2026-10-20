import Link from "next/link";
import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  // Pengecekan sesi di server: hanya admin yang sudah login boleh mengakses (US-30)
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const halamanInput = parseInt(params?.halaman, 10);
  let halaman = isNaN(halamanInput) || halamanInput < 1 ? 1 : halamanInput;
  const BATAS_PER_HALAMAN = 10;

  let semuaProduk = [];
  let produkTampil = [];
  let totalProdukTabel = 0;
  let totalHalaman = 1;
  let pesanError = null;

  try {
    const serverClient = createServerClient();

    // 1. Ambil data ringkasan seluruh katalog (US-30)
    const { data: allData, error: errAll } = await serverClient
      .from("produk")
      .select("kategori");

    if (!errAll && allData) {
      semuaProduk = allData;
    }

    // 2. Query pencarian dan paginasi untuk tabel produk admin (US-33)
    let query = serverClient
      .from("produk")
      .select("*", { count: "exact" });

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    query = query.order("id", { ascending: true });

    const dari = (halaman - 1) * BATAS_PER_HALAMAN;
    const sampai = dari + BATAS_PER_HALAMAN - 1;

    let { data, count, error } = await query.range(dari, sampai);

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      produkTampil = data || [];
      totalProdukTabel = count || 0;
      totalHalaman = Math.ceil(totalProdukTabel / BATAS_PER_HALAMAN) || 1;

      // Jika nomor halaman melebihi total halaman, sesuaikan ke halaman terakhir
      if (halaman > totalHalaman && totalProdukTabel > 0) {
        halaman = totalHalaman;
        const dariBaru = (halaman - 1) * BATAS_PER_HALAMAN;
        const sampaiBaru = dariBaru + BATAS_PER_HALAMAN - 1;
        const resBaru = await query.range(dariBaru, sampaiBaru);
        produkTampil = resBaru.data || [];
      }
    }
  } catch (err) {
    pesanError = err.message || "Gagal memuat data produk.";
  }

  // Hitung metrik ringkasan dashboard toko (US-30)
  const totalProdukKatalog = semuaProduk.length;
  const hitunganKategori = {};

  for (const p of semuaProduk) {
    const namaKat = p.kategori?.trim() || "Tanpa kategori";
    hitunganKategori[namaKat] = (hitunganKategori[namaKat] || 0) + 1;
  }

  const ringkasanKategori = Object.entries(hitunganKategori)
    .map(([kategori, jumlah]) => ({ kategori, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const totalKategoriUnik = ringkasanKategori.filter(
    (k) => k.kategori !== "Tanpa kategori"
  ).length;

  // Helper pembuat URL paginasi mempertahankan query pencarian (US-33)
  const buatUrlPaginasi = (targetHalaman) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (targetHalaman > 1) sp.set("halaman", String(targetHalaman));
    const str = sp.toString();
    return str ? `/admin?${str}` : "/admin";
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />

      {/* Bagian Ringkasan Dashboard Toko (US-30) */}
      <section aria-labelledby="judul-ringkasan" className="flex flex-col gap-4">
        <h1 id="judul-ringkasan" className="text-2xl font-extrabold tracking-tight">
          Ringkasan Toko
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kartu Total Produk */}
          <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5 shadow-sm">
            <span className="text-sm font-semibold text-teks-lembut">
              Total Produk
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-teks">
                {totalProdukKatalog}
              </span>
              <span className="rounded-md bg-utama/10 px-2 py-0.5 text-xs font-bold text-utama">
                Katalog
              </span>
            </div>
          </div>

          {/* Kartu Total Kategori */}
          <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5 shadow-sm">
            <span className="text-sm font-semibold text-teks-lembut">
              Kategori Aktif
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-teks">
                {totalKategoriUnik}
              </span>
              <span className="rounded-md bg-harga-latar px-2 py-0.5 text-xs font-bold text-harga">
                Kategori
              </span>
            </div>
          </div>

          {/* Kartu Kategori Terbanyak */}
          <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5 shadow-sm sm:col-span-2">
            <span className="text-sm font-semibold text-teks-lembut">
              Kategori Terbanyak
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="truncate text-xl font-bold text-teks">
                {ringkasanKategori[0]?.kategori || "-"}
              </span>
              {ringkasanKategori[0] && (
                <span className="rounded-md bg-garis px-2 py-0.5 text-xs font-semibold text-teks">
                  {ringkasanKategori[0].jumlah} produk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Distribusi Produk per Kategori */}
        {ringkasanKategori.length > 0 && (
          <div className="rounded-2xl border border-garis bg-permukaan p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teks-lembut">
                Jumlah Produk per Kategori
              </h2>
              <Link
                href="/admin/kategori"
                className="text-xs font-semibold text-utama hover:underline"
              >
                Kelola Kategori →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {ringkasanKategori.map(({ kategori, jumlah }) => (
                <div
                  key={kategori}
                  className="flex flex-col gap-1 rounded-xl border border-garis bg-latar p-3 transition-colors hover:border-utama"
                >
                  <span className="truncate text-xs font-medium text-teks-lembut" title={kategori}>
                    {kategori}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teks">
                      {jumlah}
                    </span>
                    <span className="text-[11px] font-semibold text-teks-lembut">
                      produk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bagian Manajemen Daftar Produk dengan Pencarian & Paginasi (US-33) */}
      <section aria-labelledby="judul-daftar-produk" className="flex flex-col gap-5 border-t border-garis pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="judul-daftar-produk" className="text-xl font-bold">
              Daftar Produk
            </h2>
            <p className="text-sm text-teks-lembut">
              Kelola produk yang tampil di katalog UMKM
            </p>
          </div>
          <Tombol href="/admin/produk/baru">+ Tambah produk</Tombol>
        </div>

        {/* Form Pencarian Produk Admin (US-33) */}
        <form method="GET" action="/admin" className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 sm:max-w-md">
            <input
              type="text"
              name="q"
              placeholder="Cari nama produk..."
              defaultValue={q}
              className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 pl-10 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-teks-lembut"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-utama px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Cari
          </button>
          {q && (
            <Link
              href="/admin"
              className="rounded-xl border border-garis bg-permukaan px-4 py-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:bg-latar"
            >
              Reset
            </Link>
          )}
        </form>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : produkTampil.length > 0 ? (
          <>
            <TabelProduk daftarProduk={produkTampil} />

            {/* Paginasi Daftar Produk Admin (US-33) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-garis pt-4 text-sm text-teks-lembut">
              <p>
                Menampilkan{" "}
                <span className="font-semibold text-teks">
                  {totalProdukTabel > 0 ? (halaman - 1) * BATAS_PER_HALAMAN + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-teks">
                  {Math.min(halaman * BATAS_PER_HALAMAN, totalProdukTabel)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-teks">{totalProdukTabel}</span>{" "}
                produk
                {q ? ` (disaring: "${q}")` : ""}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  href={buatUrlPaginasi(halaman - 1)}
                  aria-disabled={halaman <= 1}
                  className={`rounded-lg border border-garis px-3 py-1.5 font-semibold transition-colors ${
                    halaman <= 1
                      ? "pointer-events-none opacity-40 text-teks-lembut bg-permukaan"
                      : "bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                >
                  ← Sebelumnya
                </Link>

                <span className="px-2 text-xs font-bold text-teks">
                  {halaman} / {totalHalaman}
                </span>

                <Link
                  href={buatUrlPaginasi(halaman + 1)}
                  aria-disabled={halaman >= totalHalaman}
                  className={`rounded-lg border border-garis px-3 py-1.5 font-semibold transition-colors ${
                    halaman >= totalHalaman
                      ? "pointer-events-none opacity-40 text-teks-lembut bg-permukaan"
                      : "bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                >
                  Selanjutnya →
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-garis bg-permukaan p-8 text-center text-teks-lembut">
            <p className="font-semibold text-teks">
              {q ? `Tidak ada produk dengan kata kunci "${q}"` : "Belum ada produk"}
            </p>
            {q && (
              <p className="mt-1 text-sm">
                Coba gunakan kata kunci lain atau{" "}
                <Link href="/admin" className="text-utama underline hover:text-utama-gelap">
                  reset pencarian
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
