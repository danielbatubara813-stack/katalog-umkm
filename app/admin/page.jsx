import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pesanSukses = params?.success;
  const pesanAksiError = params?.error;

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  let daftarProduk = [];
  let pesanError = null;

  try {
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

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanSukses && (
        <div className="rounded-lg border border-utama/30 bg-utama/10 p-3 text-sm text-utama">
          {pesanSukses}
        </div>
      )}

      {pesanAksiError && (
        <div className="rounded-lg border border-bahaya/30 bg-bahaya/10 p-3 text-sm text-bahaya">
          {pesanAksiError}
        </div>
      )}

      {pesanError ? (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat daftar produk</p>
          <p className="mt-1 text-sm">{pesanError}</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
