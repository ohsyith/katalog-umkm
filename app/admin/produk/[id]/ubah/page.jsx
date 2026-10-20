import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// US-09 (bonus di jalur offline): ubah produk.
export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  // Pengecekan sesi admin di sisi server
  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  // Mengambil data produk lama dari database Supabase
  let { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    const serverClient = createServerClient();
    const res = await serverClient
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    produk = res.data;
    error = res.error;
  }

  if (error || !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
