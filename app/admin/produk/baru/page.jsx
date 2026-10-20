import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk, ambilKategoriDenganJumlah } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk() {
  const kategoriData = await ambilKategoriDenganJumlah();
  const daftarKategori = (kategoriData || []).map((k) => k.nama);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk
        daftarKategori={daftarKategori}
        action={tambahProduk}
        labelTombol="Simpan produk"
      />
    </div>
  );
}
