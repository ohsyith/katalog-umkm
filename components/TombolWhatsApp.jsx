import { toko } from "@/lib/toko";
import { formatRupiah, apakahProdukHabis, ambilHargaEfektif } from "@/lib/format";

export default function TombolWhatsApp({ produk, jumlah = 1, varian = null }) {
  const isHabis = apakahProdukHabis(produk);

  if (isHabis) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-garis bg-permukaan px-5 py-3 font-semibold text-teks-lembut opacity-60 sm:w-auto"
      >
        Produk Habis
      </button>
    );
  }

  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const varianText = varian ? ` - Varian: ${varian}` : "";
  const jumlahText = ` - Jumlah: ${jumlah}`;
  const hargaPakai = ambilHargaEfektif(produk);
  const pesan = `Halo, saya ingin memesan ${produk.nama} (${formatRupiah(hargaPakai)})${varianText}${jumlahText}.`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
