import { createClient } from "@supabase/supabase-js";

/**
 * Membuat koneksi Supabase di sisi server menggunakan kunci rahasia (SUPABASE_SECRET_KEY).
 * Koneksi ini digunakan untuk membaca data publik (seperti katalog dan detail produk)
 * yang melewati RLS tanpa mengirim kunci rahasia ke browser.
 */
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createClient(cleanUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { createServerClient as createClient };
