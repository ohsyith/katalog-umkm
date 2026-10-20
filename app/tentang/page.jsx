import Link from "next/link";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang Kami - ${toko.nama}`,
  description: `Profil resmi, jam operasional, alamat, dan kontak ${toko.nama}.`,
};

export default function HalamanTentang() {
  const nomorWA = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const pesanTanya = encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya mengenai produk di katalog Anda.`
  );
  const linkWA = `https://wa.me/${nomorWA}?text=${pesanTanya}`;

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
      >
        ← Kembali ke katalog
      </Link>

      <div className="mt-6 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-utama">
            Profil Toko
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tentang {toko.nama}
          </h1>
          {toko.tagline && (
            <p className="mt-1 text-base leading-relaxed text-teks-lembut sm:text-lg">
              {toko.tagline}
            </p>
          )}
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Kartu Alamat */}
          <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-latar text-utama border border-garis">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-teks">Alamat Usaha</h2>
              <p className="mt-1 text-sm leading-relaxed text-teks-lembut">
                {toko.alamat}
              </p>
            </div>
          </div>

          {/* Kartu Jam Operasional */}
          <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-latar text-utama border border-garis">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-teks">Jam Operasional</h2>
              <p className="mt-1 text-sm leading-relaxed text-teks-lembut">
                {toko.jamBuka}
              </p>
            </div>
          </div>
        </div>

        {/* Bagian Hubungi Kami & Chat WhatsApp */}
        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-garis bg-permukaan p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-teks">Ada Pertanyaan?</h2>
            <p className="text-sm leading-relaxed text-teks-lembut">
              Hubungi kami langsung via WhatsApp untuk pertanyaan produk, kustomisasi pesanan, atau informasi pengiriman.
            </p>
            <p className="text-sm font-semibold text-teks">
              WhatsApp: +{nomorWA}
            </p>
          </div>
          <a
            href={linkWA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-utama px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-utama-gelap"
          >
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.584 1.769.877 2.796.877 3.182 0 5.768-2.587 5.768-5.766.001-3.18-2.585-5.764-5.768-5.764zm3.376 8.21c-.14.394-.814.734-1.127.765-.313.031-.699.043-1.144-.099-.444-.143-1.02-.34-1.768-.667-1.314-.575-2.164-1.89-2.23-1.977-.066-.088-.535-.712-.535-1.358s.341-.963.462-1.094c.121-.131.264-.165.352-.165.088 0 .176 0 .253.005.081.005.188-.031.294.225.109.263.373.91.406.977.033.066.055.143.011.23-.044.088-.066.143-.132.22-.066.077-.139.172-.199.231-.066.066-.135.138-.058.27.077.132.343.565.736.914.507.45 1.054.675 1.204.75.15.075.238.066.326-.035.088-.101.374-.436.474-.585.1-.149.2-.124.333-.075.133.05.845.398.99.471.145.073.242.109.277.17.035.061.035.355-.105.749z" />
            </svg>
            <span>Chat via WhatsApp</span>
          </a>
        </section>
      </div>
    </div>
  );
}

