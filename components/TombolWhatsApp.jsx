"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import {
  buatPesanPesanan,
  jumlahBerikutnya,
} from "@/lib/pesan-pesanan";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const pesan = buatPesanPesanan(produk, jumlah);
  const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <p id="label-jumlah" className="mb-2 text-sm font-semibold">
          Jumlah
        </p>
        <div
          className="inline-flex items-center overflow-hidden rounded-lg border border-garis"
          aria-labelledby="label-jumlah"
        >
          <button
            type="button"
            aria-label="Kurangi jumlah"
            onClick={() => setJumlah((nilai) => jumlahBerikutnya(nilai, -1))}
            disabled={jumlah === 1}
            className="px-4 py-2 text-lg font-semibold text-teks hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-50"
          >
            −
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="min-w-12 border-x border-garis px-3 py-2 text-center font-semibold"
          >
            {jumlah}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            onClick={() => setJumlah((nilai) => jumlahBerikutnya(nilai, 1))}
            disabled={jumlah === Number.MAX_SAFE_INTEGER}
            className="px-4 py-2 text-lg font-semibold text-teks hover:bg-permukaan"
          >
            +
          </button>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
