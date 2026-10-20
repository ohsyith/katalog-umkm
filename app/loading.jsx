export default function LoadingKatalog() {
  return (
    <div className="flex flex-col gap-8 py-8 animate-pulse">
      {/* Skeleton Hero / Header */}
      <div className="flex flex-col gap-3">
        <div className="h-8 w-48 rounded-lg bg-garis" />
        <div className="h-4 w-72 rounded bg-garis/60" />
      </div>

      {/* Skeleton Filter & Pencarian */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full max-w-sm rounded-xl bg-garis" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-garis/60" />
          ))}
        </div>
      </div>

      {/* Skeleton Grid Kartu Produk (2 kolom di HP, 3-4 di layar lebar) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
          >
            {/* Foto skeleton */}
            <div className="aspect-square w-full bg-garis" />
            <div className="flex flex-1 flex-col gap-2.5 p-3">
              <div className="h-3 w-16 rounded bg-garis/60" />
              <div className="h-4 w-full rounded bg-garis" />
              <div className="h-4 w-3/4 rounded bg-garis" />
              <div className="mt-auto pt-2">
                <div className="h-6 w-24 rounded-md bg-garis/80" />
              </div>
            </div>
            <div className="p-3 pt-0">
              <div className="h-8 w-full rounded-lg bg-garis/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

