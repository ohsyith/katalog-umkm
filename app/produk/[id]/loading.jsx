export default function LoadingDetailProduk() {
  return (
    <article className="grid gap-8 py-8 animate-pulse md:grid-cols-2 md:py-12">
      {/* Kolom Kiri: Galeri Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full rounded-2xl bg-garis" />
        <div className="flex gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-16 rounded-xl bg-garis/70" />
          ))}
        </div>
      </div>

      {/* Kolom Kanan: Rincian Produk Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 rounded bg-garis/60" />
        <div className="h-4 w-20 rounded bg-garis/60" />

        <div className="flex items-start justify-between gap-4">
          <div className="h-9 w-3/4 rounded-lg bg-garis" />
          <div className="h-10 w-10 shrink-0 rounded-xl bg-garis/70" />
        </div>

        <div className="h-8 w-36 rounded-md bg-garis/80" />

        <div className="flex flex-col gap-2 pt-2">
          <div className="h-4 w-full rounded bg-garis/60" />
          <div className="h-4 w-5/6 rounded bg-garis/60" />
          <div className="h-4 w-4/6 rounded bg-garis/60" />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="h-12 w-full rounded-xl bg-garis sm:w-44" />
          <div className="h-12 w-full rounded-xl bg-garis sm:w-44" />
        </div>
      </div>
    </article>
  );
}

