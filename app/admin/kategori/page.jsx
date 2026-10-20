import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import KelolaKategori from "@/components/KelolaKategori";
import { ambilKategoriDenganJumlah } from "@/app/admin/actions";
import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Kategori - Admin Katalog UMKM",
};

export default async function HalamanAdminKategori() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const daftarKategori = await ambilKategoriDenganJumlah();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Kelola Kategori</h1>
        <p className="text-sm text-teks-lembut">
          Atur daftar kategori produk untuk mengelompokkan katalog toko Anda
        </p>
      </div>

      <KelolaKategori daftarKategori={daftarKategori} />
    </div>
  );
}

