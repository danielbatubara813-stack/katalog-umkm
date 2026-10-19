"use client";

import Tombol from "@/components/Tombol";
import { deleteProduct } from "@/app/admin/actions";

export default function TombolHapusProduk({ id }) {
  function konfirmasiHapus(event) {
    if (!window.confirm("Apakah kamu yakin ingin menghapus produk ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteProduct} onSubmit={konfirmasiHapus}>
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}
