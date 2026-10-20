export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

/**
 * Memeriksa apakah produk berstatus stok habis (US-19).
 * Mendukung kolom 'stok' (<= 0), 'status_stok' ('habis'), dsb.
 */
export function apakahProdukHabis(produk) {
  if (!produk) return false;
  if (produk.status_stok === "habis" || produk.status === "habis" || produk.habis === true) {
    return true;
  }
  if (produk.stok !== undefined && produk.stok !== null && String(produk.stok).trim() !== "") {
    const nilaiStok = Number(produk.stok);
    if (!isNaN(nilaiStok) && nilaiStok <= 0) {
      return true;
    }
  }
  return false;
}

/**
 * Memeriksa apakah produk memiliki harga diskon yang valid (US-20).
 */
export function apakahAdaDiskon(produk) {
  if (!produk) return false;
  const normal = Number(produk.harga) || 0;
  const diskon = Number(produk.harga_diskon);
  return Boolean(!isNaN(diskon) && diskon > 0 && diskon < normal);
}

/**
 * Mengambil harga aktif/efektif produk (harga diskon jika valid, jika tidak harga normal).
 */
export function ambilHargaEfektif(produk) {
  if (!produk) return 0;
  if (apakahAdaDiskon(produk)) {
    return Number(produk.harga_diskon);
  }
  return Number(produk.harga) || 0;
}

/**
 * Memeriksa apakah produk berstatus aktif (US-32).
 * Mendukung kolom 'aktif' di database dan tag status '[nonaktif]' di deskripsi.
 */
export function apakahProdukAktif(produk) {
  if (!produk) return false;
  if (produk.aktif !== undefined && produk.aktif !== null) {
    return Boolean(produk.aktif);
  }
  if (typeof produk.deskripsi === "string" && produk.deskripsi.includes("[nonaktif]")) {
    return false;
  }
  return true;
}
