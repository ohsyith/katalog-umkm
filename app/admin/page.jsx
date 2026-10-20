import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  // Pengecekan sesi di server: hanya admin yang sudah login boleh mengakses (US-30)
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  let daftarProduk = null;
  let pesanError = null;

  try {
    let { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      // Fallback ke server client (secret key) jika diperlukan
      const serverClient = createServerClient();
      const res = await serverClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });
      data = res.data;
      error = res.error;
    }

    if (error) {
      pesanError = `Gagal memuat data: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Gagal memuat data produk.";
  }

  // Hitung metrik ringkasan dashboard toko (US-30)
  const totalProduk = daftarProduk ? daftarProduk.length : 0;
  const hitunganKategori = {};

  if (daftarProduk) {
    for (const p of daftarProduk) {
      const namaKat = p.kategori?.trim() || "Tanpa kategori";
      hitunganKategori[namaKat] = (hitunganKategori[namaKat] || 0) + 1;
    }
  }

  // Urutkan kategori dari jumlah terbanyak (US-30)
  const ringkasanKategori = Object.entries(hitunganKategori)
    .map(([kategori, jumlah]) => ({ kategori, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);

  const totalKategoriUnik = ringkasanKategori.filter(
    (k) => k.kategori !== "Tanpa kategori"
  ).length;

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
                {totalProduk}
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-teks-lembut">
              Jumlah Produk per Kategori
            </h2>
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

      {/* Bagian Manajemen Daftar Produk */}
      <section aria-labelledby="judul-daftar-produk" className="flex flex-col gap-4 border-t border-garis pt-6">
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

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : daftarProduk && daftarProduk.length > 0 ? (
          <TabelProduk daftarProduk={daftarProduk} />
        ) : (
          <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
        )}
      </section>
    </div>
  );
}
