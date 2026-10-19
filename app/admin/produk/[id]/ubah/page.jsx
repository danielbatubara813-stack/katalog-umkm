import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createServerClient } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const pesanError = resolvedSearchParams?.error;

  const supabase = createServerClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  // Bind id ke action agar tersedia sebagai argumen pertama
  const ubahProdukDenganId = ubahProduk.bind(null, id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>

      {pesanError && (
        <div className="max-w-xl rounded-lg border border-bahaya/30 bg-bahaya/10 p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}

      <FormProduk produk={produk} action={ubahProdukDenganId} labelTombol="Simpan perubahan" />
    </div>
  );
}
