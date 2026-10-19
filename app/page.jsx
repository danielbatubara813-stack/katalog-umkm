import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";
import {
  filterProduk,
  getKategoriTersedia,
} from "@/lib/filter-produk.mjs";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const pencarian =
    typeof params?.q === "string" ? params.q.trim() : "";
  const kategoriPermintaan =
    typeof params?.kategori === "string" ? params.kategori : "";

  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message;
  }

  const kategoriTersedia = getKategoriTersedia(daftarProduk);
  const kategoriDipilih = kategoriTersedia.includes(kategoriPermintaan)
    ? kategoriPermintaan
    : "";

  const produkDitampilkan = filterProduk(
    daftarProduk,
    pencarian,
    kategoriDipilih
  );

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        {pesanError ? (
          <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-4 text-bahaya">
            <p className="font-semibold">Gagal memuat daftar produk</p>
            <p className="mt-1 text-sm">{pesanError}</p>
          </div>
        ) : (
          <>
            <form
              action="/"
              method="get"
              className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label htmlFor="pencarian-produk" className="mb-1 block text-sm font-semibold">
                  Cari nama produk
                </label>
                <input
                  id="pencarian-produk"
                  name="q"
                  type="search"
                  defaultValue={pencarian}
                  placeholder="Contoh: kopi"
                  className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="kategori-produk" className="mb-1 block text-sm font-semibold">
                  Kategori
                </label>
                <select
                  id="kategori-produk"
                  name="kategori"
                  defaultValue={kategoriDipilih}
                  className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-sm"
                >
                  <option value="">Semua kategori</option>
                  {kategoriTersedia.map((kategori) => (
                    <option key={kategori} value={kategori}>
                      {kategori}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
              >
                Cari
              </button>
              {(pencarian || kategoriDipilih) && (
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
                >
                  Hapus filter
                </a>
              )}
            </form>
            {produkDitampilkan.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {produkDitampilkan.map((produk) => (
                  <KartuProduk key={produk.id} produk={produk} />
                ))}
              </div>
            ) : pencarian || kategoriDipilih ? (
              <p className="py-8 text-teks-lembut">Produk tidak ditemukan</p>
            ) : (
              <p className="py-8 text-teks-lembut">Belum ada produk</p>
            )}
          </>
        )}
      </section>
    </>
  );
}
