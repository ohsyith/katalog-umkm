import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  // Pengecekan sesi di server: hanya admin yang sudah login boleh mengakses
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
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data;
    }
  } catch (err) {
    pesanError = err.message || "Gagal memuat data produk.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
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
    </div>
  );
}
