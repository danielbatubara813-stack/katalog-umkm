import { formatRupiah } from "./format.js";

export function jumlahBerikutnya(jumlah, perubahan) {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, jumlah + perubahan));
}

export function buatPesanPesanan(produk, jumlah, varian = "") {
  const hargaSatuan = formatRupiah(produk.harga).replace(/\s+/g, " ");
  const barisPesan = [
    "Halo, saya ingin memesan:",
    `Produk: ${produk.nama}`,
    `Jumlah: ${jumlah}`,
  ];

  if (varian) {
    barisPesan.push(`Varian: ${varian}`);
  }

  barisPesan.push(`Harga satuan: ${hargaSatuan}`);

  if (jumlah > 1) {
    const totalHarga = formatRupiah(produk.harga * jumlah).replace(/\s+/g, " ");
    barisPesan.push(`Total: ${totalHarga}`);
  }

  return barisPesan.join("\n");
}
