import Link from "next/link";
import { toko } from "@/lib/toko";
import TombolKeranjangNav from "@/components/TombolKeranjangNav";
import TombolFavoritNav from "@/components/TombolFavoritNav";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <div className="flex items-center gap-2.5">
          <TombolFavoritNav />
          <TombolKeranjangNav />
        </div>
      </div>
    </header>
  );
}
