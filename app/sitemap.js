import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || "https://katalog-umkm.vercel.app";

  let daftarProduk = [];
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("id, created_at")
      .order("id", { ascending: true });

    if (!error && Array.isArray(data)) {
      daftarProduk = data;
    }
  } catch (err) {
    // Menangani kegagalan koneksi database saat build dengan aman (US-27)
    console.error("Gagal mengambil daftar produk untuk sitemap:", err);
  }

  const ruteStatis = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/keranjang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const ruteProduk = daftarProduk.map((p) => ({
    url: `${baseUrl}/produk/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...ruteStatis, ...ruteProduk];
}

