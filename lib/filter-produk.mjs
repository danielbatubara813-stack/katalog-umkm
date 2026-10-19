export function getKategoriTersedia(daftarProduk) {
  return [
    ...new Set(
      daftarProduk
        .map((produk) => produk.kategori?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "id"));
}

export function filterProduk(daftarProduk, pencarian, kategori) {
  const namaDicari = pencarian.toLocaleLowerCase("id");

  return daftarProduk.filter((produk) => {
    const cocokNama = produk.nama.toLocaleLowerCase("id").includes(namaDicari);
    const cocokKategori =
      !kategori || produk.kategori?.trim() === kategori;

    return cocokNama && cocokKategori;
  });
}
