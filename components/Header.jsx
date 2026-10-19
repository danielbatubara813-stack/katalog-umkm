import Link from "next/link";
import { toko } from "@/lib/toko";
import InstalasiPWA from "@/components/InstalasiPWA";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <InstalasiPWA />
      </div>
    </header>
  );
}
