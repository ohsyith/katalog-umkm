"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Helper untuk memastikan admin sudah login sebelum menjalankan aksi yang mengubah data.
 * Memeriksa sesi auth dari cookie di server.
 */
export async function requireAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: admin belum login.");
  }

  return { user, supabase };
}

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 * Dipanggil dari form di app/admin/login/page.jsx.
 */
export async function login(prevState, formData) {
  // Mendukung pemanggilan baik melalui useActionState maupun form action langsung
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get("email")?.toString()?.trim();
  const password = data?.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let authError = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    authError = error;
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat menghubungi server.",
    };
  }

  if (authError) {
    return {
      error:
        authError.message === "Invalid login credentials"
          ? "Email atau password salah. Silakan periksa kembali."
          : authError.message || "Gagal masuk. Silakan coba lagi.",
    };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout)
 * dan mengarahkan kembali ke halaman login.
 */
export async function logout() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal keluar:", err);
  }

  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Dipanggil dari form di app/admin/password/page.jsx.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get("password_baru")?.toString();
  const konfirmasiPassword = data?.get("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  try {
    const { supabase } = await requireAuth();

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return {
        error: error.message || "Gagal mengganti password.",
      };
    }

    return { success: "Password berhasil diganti." };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat mengganti password.",
    };
  }
}

/**
 * Server Action untuk menambah produk baru ke tabel "produk" di Supabase.
 * Dipanggil dari form di app/admin/produk/baru/page.jsx.
 */
export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const nama = data?.get("nama")?.toString()?.trim();
  const hargaRaw = data?.get("harga")?.toString()?.trim();
  const kategori = data?.get("kategori")?.toString()?.trim() || null;
  const foto_url = data?.get("foto_url")?.toString()?.trim() || null;
  const deskripsi = data?.get("deskripsi")?.toString()?.trim() || null;

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka dan tidak boleh negatif." };
  }

  let supabase;
  try {
    const authResult = await requireAuth();
    supabase = authResult.supabase;
  } catch (err) {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (insertError) {
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
