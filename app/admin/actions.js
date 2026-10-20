"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { createServerClient } from "@/lib/supabase/server";

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
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

/**
 * Server Action untuk keluar (logout) admin.
 * Menghapus sesi auth di cookie via Supabase Auth.
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

  if (passwordBaru.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak cocok dengan password baru." };
  }

  let supabase;
  try {
    const authResult = await requireAuth();
    supabase = authResult.supabase;
  } catch (err) {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: `Gagal mengganti password: ${error.message}` };
    }
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat mengganti password.",
    };
  }

  return { success: true };
}

/**
 * Helper untuk mem-parsing textarea foto_tambahan menjadi array URL teks bersih (US-18).
 */
function parseFotoTambahan(input) {
  if (!input) return [];

  let teks = "";
  if (typeof input === "string") {
    teks = input;
  } else if (typeof input?.toString === "function") {
    teks = input.toString();
  }

  return teks
    .split("\n")
    .map((baris) => baris.trim())
    .filter((baris) => baris.length > 0);
}

/**
 * Helper untuk membuat path unik yang aman di Supabase Storage (US-29).
 */
function buatPathStorage(namaFile) {
  const namaAman = namaFile
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
  const unik = `${Date.now()}-${crypto.randomUUID()}-${namaAman}`;
  return unik;
}

/**
 * Validasi MIME type dan ukuran file gambar (US-29).
 */
function validasiFileFoto(file) {
  const MIME_DIIZINKAN = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAKS_UKURAN = 2 * 1024 * 1024; // 2 MB

  if (!file || !(file instanceof File) || file.size === 0) {
    return "File kosong tidak bisa diunggah.";
  }
  if (!MIME_DIIZINKAN.includes(file.type)) {
    return `Foto "${file.name}" bukan gambar. File harus berupa gambar (JPG, PNG, WEBP, atau GIF).`;
  }
  if (file.size > MAKS_UKURAN) {
    return `Foto "${file.name}" melebihi ukuran maksimal 2 MB.`;
  }
  return null;
}

/**
 * Upload satu file ke Supabase Storage bucket "produk" menggunakan server client.
 */
async function uploadFileFoto(supabase, file) {
  const path = buatPathStorage(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("produk")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Gagal mengunggah foto "${file.name}" ke Storage. Pastikan bucket 'produk' sudah dibuat. Detail: ${uploadError.message}`
    );
  }

  const { data: pubData } = supabase.storage.from("produk").getPublicUrl(path);
  return pubData.publicUrl;
}

/**
 * Server Action untuk menambah produk baru ke tabel "produk" di Supabase.
 * Dilengkapi validasi server per field (US-34).
 */
export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const nama = data?.get("nama")?.toString()?.trim();
  const hargaRaw = data?.get("harga")?.toString()?.trim();
  const kategori = data?.get("kategori")?.toString()?.trim() || null;
  let foto_url = data?.get("foto_url")?.toString()?.trim() || null;
  const foto_tambahan_raw = data?.get("foto_tambahan")?.toString() || "";
  const foto_tambahan_url = parseFotoTambahan(foto_tambahan_raw);
  const deskripsi = data?.get("deskripsi")?.toString()?.trim() || null;

  // Validasi per field di server (US-34)
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }

  const harga = parseInt(hargaRaw, 10);
  if (hargaRaw === undefined || hargaRaw === "" || isNaN(harga) || harga < 0) {
    errors.harga = "Harga produk harus berupa angka positif (minimal 0).";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Terdapat data yang belum sesuai. Periksa input yang ditandai.",
      errors,
      values: {
        nama: nama || "",
        harga: hargaRaw || "",
        kategori: kategori || "",
        foto_url: foto_url || "",
        foto_tambahan: foto_tambahan_raw,
        deskripsi: deskripsi || "",
      },
    };
  }

  // requireAuth di server
  try {
    await requireAuth();
  } catch (err) {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  const serverClient = createServerClient();

  // Ambil file yang diunggah (US-29)
  const fotoFile = data?.get("foto_file");
  const fotoTambahanFiles = data?.getAll("foto_tambahan_files") ?? [];

  // Validasi dan upload foto utama
  if (fotoFile instanceof File && fotoFile.size > 0) {
    const errValidasi = validasiFileFoto(fotoFile);
    if (errValidasi) return { error: errValidasi };

    try {
      foto_url = await uploadFileFoto(serverClient, fotoFile);
    } catch (err) {
      return { error: err.message };
    }
  }

  // Validasi dan upload foto tambahan
  const fotoTambahanUpload = [];
  const validFiles = fotoTambahanFiles.filter(
    (f) => f instanceof File && f.size > 0
  );

  for (const file of validFiles) {
    const errValidasi = validasiFileFoto(file);
    if (errValidasi) return { error: errValidasi };

    try {
      const url = await uploadFileFoto(serverClient, file);
      fotoTambahanUpload.push(url);
    } catch (err) {
      return { error: err.message };
    }
  }

  const semuaFotoTambahan = [
    ...fotoTambahanUpload,
    ...foto_tambahan_url.filter((u) => !fotoTambahanUpload.includes(u)),
  ];

  const { error: insertError } = await serverClient
    .from("produk")
    .insert({
      nama,
      harga,
      kategori,
      foto_url,
      foto_tambahan: semuaFotoTambahan,
      deskripsi,
    });

  if (insertError) {
    console.error("Gagal insert produk:", insertError);
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Server Action untuk mengubah produk yang sudah ada di database Supabase.
 * Dilengkapi validasi server per field (US-34).
 */
export async function ubahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const idRaw = data?.get("id");
  const id = parseInt(idRaw, 10) || idRaw;
  const nama = data?.get("nama")?.toString()?.trim();
  const hargaRaw = data?.get("harga")?.toString()?.trim();
  const kategori = data?.get("kategori")?.toString()?.trim() || null;
  let foto_url = data?.get("foto_url")?.toString()?.trim() || null;
  const foto_tambahan_raw = data?.get("foto_tambahan")?.toString() || "";
  const foto_tambahan_url = parseFotoTambahan(foto_tambahan_raw);
  const deskripsi = data?.get("deskripsi")?.toString()?.trim() || null;

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  // Validasi per field di server (US-34)
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }

  const harga = parseInt(hargaRaw, 10);
  if (hargaRaw === undefined || hargaRaw === "" || isNaN(harga) || harga < 0) {
    errors.harga = "Harga produk harus berupa angka positif (minimal 0).";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: "Terdapat data yang belum sesuai. Periksa input yang ditandai.",
      errors,
      values: {
        id,
        nama: nama || "",
        harga: hargaRaw || "",
        kategori: kategori || "",
        foto_url: foto_url || "",
        foto_tambahan: foto_tambahan_raw,
        deskripsi: deskripsi || "",
      },
    };
  }

  try {
    await requireAuth();
  } catch (err) {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  const serverClient = createServerClient();

  const fotoFile = data?.get("foto_file");
  const fotoTambahanFiles = data?.getAll("foto_tambahan_files") ?? [];

  if (fotoFile instanceof File && fotoFile.size > 0) {
    const errValidasi = validasiFileFoto(fotoFile);
    if (errValidasi) return { error: errValidasi };

    try {
      foto_url = await uploadFileFoto(serverClient, fotoFile);
    } catch (err) {
      return { error: err.message };
    }
  }

  const fotoTambahanUpload = [];
  const validFiles = fotoTambahanFiles.filter(
    (f) => f instanceof File && f.size > 0
  );

  for (const file of validFiles) {
    const errValidasi = validasiFileFoto(file);
    if (errValidasi) return { error: errValidasi };

    try {
      const url = await uploadFileFoto(serverClient, file);
      fotoTambahanUpload.push(url);
    } catch (err) {
      return { error: err.message };
    }
  }

  const semuaFotoTambahan = [
    ...fotoTambahanUpload,
    ...foto_tambahan_url.filter((u) => !fotoTambahanUpload.includes(u)),
  ];

  const { error: updateError } = await serverClient
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      foto_tambahan: semuaFotoTambahan,
      deskripsi,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Gagal update produk:", updateError);
    return { error: `Gagal memperbarui produk: ${updateError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

/**
 * Server Action untuk toggle status aktif/nonaktif produk (US-32).
 */
export async function toggleStatusProduk(idProduk) {
  try {
    await requireAuth();
  } catch {
    return { error: "Akses ditolak: admin belum login." };
  }

  const id = parseInt(idProduk, 10) || idProduk;
  const serverClient = createServerClient();

  const { data: produk, error: fetchError } = await serverClient
    .from("produk")
    .select("id, deskripsi")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !produk) {
    return { error: "Produk tidak ditemukan." };
  }

  // Tentukan status saat ini
  const isNonaktif = produk.deskripsi && produk.deskripsi.includes("[nonaktif]");
  const statusBaruAktif = isNonaktif; // Jika sekarang nonaktif, jadikan aktif

  let deskripsiBaru = produk.deskripsi || "";
  if (!statusBaruAktif) {
    if (!deskripsiBaru.includes("[nonaktif]")) {
      deskripsiBaru = `${deskripsiBaru} [nonaktif]`.trim();
    }
  } else {
    deskripsiBaru = deskripsiBaru.replace(/\[nonaktif\]/g, "").trim();
  }

  // Coba update (baik deskripsi maupun kolom aktif jika ada)
  try {
    const { error: updateError } = await serverClient
      .from("produk")
      .update({
        deskripsi: deskripsiBaru,
      })
      .eq("id", id);

    if (updateError) {
      return { error: `Gagal mengubah status: ${updateError.message}` };
    }
  } catch (err) {
    return { error: err.message || "Gagal mengubah status produk." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  return { success: true, aktif: statusBaruAktif };
}

/**
 * Server Action untuk menghapus baris produk dari tabel "produk" di Supabase.
 */
export async function hapusProduk(idOrFormData) {
  const id =
    idOrFormData instanceof FormData
      ? idOrFormData.get("id")
      : typeof idOrFormData === "object" && idOrFormData?.id
        ? idOrFormData.id
        : idOrFormData;

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  try {
    await requireAuth();
  } catch (err) {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  const serverClient = createServerClient();

  const { error } = await serverClient.from("produk").delete().eq("id", id);

  if (error) {
    return { error: `Gagal menghapus produk: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  return { success: true };
}

/**
 * Helper untuk mengambil daftar kategori beserta jumlah produknya (US-31).
 */
export async function ambilKategoriDenganJumlah() {
  const serverClient = createServerClient();

  const { data: produkList } = await serverClient
    .from("produk")
    .select("kategori");

  const hitungan = {};
  for (const p of produkList || []) {
    const kat = p.kategori?.trim();
    if (kat) {
      hitungan[kat] = (hitungan[kat] || 0) + 1;
    }
  }

  let kategoriTabel = [];
  try {
    const { data: katData } = await serverClient
      .from("kategori")
      .select("nama")
      .order("nama", { ascending: true });
    if (katData) {
      kategoriTabel = katData;
    }
  } catch {
    // Abaikan jika tabel kategori belum dibuat di Supabase
  }

  const setKategori = new Set([
    ...kategoriTabel.map((k) => k.nama),
    ...Object.keys(hitungan),
  ]);

  return Array.from(setKategori)
    .sort()
    .map((nama) => ({
      nama,
      jumlahProduk: hitungan[nama] || 0,
    }));
}

/**
 * Server Action untuk menambah kategori baru (US-31).
 */
export async function tambahKategori(prevState, formData) {
  try {
    await requireAuth();
  } catch {
    return { error: "Akses ditolak: admin belum login." };
  }

  const data = formData instanceof FormData ? formData : prevState;
  const nama = data?.get("nama")?.toString()?.trim();

  if (!nama) {
    return { error: "Nama kategori wajib diisi." };
  }

  const serverClient = createServerClient();
  try {
    const { error } = await serverClient.from("kategori").insert({ nama });
    if (error) {
      if (error.code === "23505") {
        return { error: `Kategori "${nama}" sudah ada.` };
      }
      return { error: `Gagal menambah kategori: ${error.message}` };
    }
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/**
 * Server Action untuk mengubah nama kategori (US-31).
 * Otomatis memperbarui kolom kategori di semua produk terkait.
 */
export async function ubahKategori(prevState, formData) {
  try {
    await requireAuth();
  } catch {
    return { error: "Akses ditolak: admin belum login." };
  }

  const data = formData instanceof FormData ? formData : prevState;
  const namaLama = data?.get("namaLama")?.toString()?.trim();
  const namaBaru = data?.get("namaBaru")?.toString()?.trim();

  if (!namaLama || !namaBaru) {
    return { error: "Nama lama dan nama baru wajib diisi." };
  }

  if (namaLama.toLowerCase() === namaBaru.toLowerCase()) {
    return { error: "Nama baru tidak boleh sama persis dengan nama lama." };
  }

  const serverClient = createServerClient();

  // 1. Update nama kategori di seluruh produk terkait
  const { error: errProduk } = await serverClient
    .from("produk")
    .update({ kategori: namaBaru })
    .eq("kategori", namaLama);

  if (errProduk) {
    return { error: `Gagal memperbarui kategori pada produk: ${errProduk.message}` };
  }

  // 2. Update di tabel kategori jika tabel ada
  try {
    await serverClient
      .from("kategori")
      .update({ nama: namaBaru })
      .eq("nama", namaLama);
  } catch {
    // Abaikan jika tabel kategori belum dibuat
  }

  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/**
 * Server Action untuk menghapus kategori (US-31).
 * Menolak penghapusan jika masih ada produk yang menggunakan kategori ini.
 */
export async function hapusKategori(namaKategori) {
  try {
    await requireAuth();
  } catch {
    return { error: "Akses ditolak: admin belum login." };
  }

  const nama =
    namaKategori instanceof FormData
      ? namaKategori.get("nama")?.toString()?.trim()
      : typeof namaKategori === "string"
      ? namaKategori.trim()
      : null;

  if (!nama) {
    return { error: "Nama kategori tidak valid." };
  }

  const serverClient = createServerClient();

  // Periksa apakah kategori masih dipakai oleh produk (US-31)
  const { count, error: errCount } = await serverClient
    .from("produk")
    .select("*", { count: "exact", head: true })
    .eq("kategori", nama);

  if (errCount) {
    return { error: `Gagal memeriksa pemakaian kategori: ${errCount.message}` };
  }

  if (count && count > 0) {
    return {
      error: `Kategori "${nama}" masih digunakan oleh ${count} produk. Pindahkan atau hapus produk terkait terlebih dahulu sebelum menghapus kategori ini.`,
    };
  }

  // Hapus dari tabel kategori jika ada
  try {
    await serverClient.from("kategori").delete().eq("nama", nama);
  } catch {
    // Abaikan
  }

  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/**
 * Server Action untuk membuat deskripsi produk secara otomatis dengan Gemini API (US-14).
 */
export async function buatDeskripsiAI(nama, kategori) {
  try {
    await requireAuth();
  } catch {
    return { error: "Akses ditolak: kamu harus login sebagai admin." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum dikonfigurasi di environment variable (.env.local).",
    };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk wajib diisi sebelum membuat deskripsi." };
  }

  const prompt = `Buat deskripsi produk dalam bahasa Indonesia yang menarik, singkat (1-2 kalimat), dan cocok untuk katalog toko UMKM.\nNama produk: ${nama.trim()}\nKategori: ${kategori?.trim() || "Umum"}\nBerikan hanya teks deskripsi produk saja tanpa tanda petik, awalan, atau catatan tambahan.`;

  try {
    let response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok && response.status === 404) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg =
        errJson?.error?.message ||
        `Panggilan Gemini API gagal dengan status ${response.status}.`;
      return { error: errMsg };
    }

    const data = await response.json();
    const deskripsi =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!deskripsi) {
      return { error: "Gemini tidak mengembalikan teks deskripsi." };
    }

    return { deskripsi };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan saat memanggil Gemini API.",
    };
  }
}

}