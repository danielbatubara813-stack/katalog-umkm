"use client";

import { useRef, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiDenganAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const formRef = useRef(null);
  const [sedangMembuat, setSedangMembuat] = useState(false);
  const [statusAI, setStatusAI] = useState(null);

  async function buatDeskripsi() {
    if (!formRef.current) return;

    setSedangMembuat(true);
    setStatusAI(null);

    try {
      const hasil = await buatDeskripsiDenganAI(
        new FormData(formRef.current)
      );

      if (hasil.error) {
        setStatusAI({ jenis: "error", pesan: hasil.error });
        return;
      }

      const kolomDeskripsi = formRef.current.elements.namedItem("deskripsi");
      kolomDeskripsi.value = hasil.deskripsi;
      setStatusAI({
        jenis: "sukses",
        pesan: "Deskripsi dibuat. Tinjau dan edit sebelum menyimpan produk.",
      });
    } catch {
      setStatusAI({
        jenis: "error",
        pesan: "Deskripsi gagal dibuat. Silakan coba lagi.",
      });
    } finally {
      setSedangMembuat(false);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex max-w-xl flex-col gap-4">
      <Input
        label="Nama produk"
        name="nama"
        defaultValue={produk.nama}
        maxLength={120}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={produk.kategori}
        maxLength={80}
      />
      <Input
        label="Informasi utama produk (untuk deskripsi AI)"
        name="informasi_ai"
        placeholder="Informasi produk yang ingin disebutkan"
        maxLength={400}
      />
      <Input
        label="Karakteristik yang diketahui (untuk deskripsi AI)"
        name="karakteristik_ai"
        textarea
        rows={3}
        placeholder="Contoh: ukuran, bahan, rasa, cara pembuatan—hanya yang sudah diketahui"
        maxLength={600}
      />
      <div className="flex flex-col items-start gap-2">
        <Tombol
          type="button"
          varian="garis"
          onClick={buatDeskripsi}
          disabled={sedangMembuat}
        >
          {sedangMembuat ? "Sedang membuat..." : "Buat deskripsi dengan AI"}
        </Tombol>
        {statusAI && (
          <p
            role={statusAI.jenis === "error" ? "alert" : "status"}
            className={`text-sm ${
              statusAI.jenis === "error" ? "text-bahaya" : "text-utama"
            }`}
          >
            {statusAI.pesan}
          </p>
        )}
      </div>
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={sedangMembuat}>
          {labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
