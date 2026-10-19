"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

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

