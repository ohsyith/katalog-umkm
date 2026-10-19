import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat koneksi Supabase sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY
 * dan cookie login (@supabase/ssr).
 * Digunakan untuk login, keluar, ganti password, dan aksi kelola produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createServerClient(cleanUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component, abaikan jika tidak bisa set cookie
        }
      },
    },
  });
}

export { createSessionClient as createAdminSessionClient };

