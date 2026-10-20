import { createServerClient } from "@/lib/supabase/server";
import DaftarFavorit from "@/components/DaftarFavorit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produk Favorit",
};

export default async function HalamanFavorit() {
  let semuaProduk = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else if (data) {
      semuaProduk = data;
    }
  } catch (err) {
    pesanError = err.message || "Gagal menghubungi database.";
  }

  return <DaftarFavorit semuaProduk={semuaProduk} error={pesanError} />;
}

