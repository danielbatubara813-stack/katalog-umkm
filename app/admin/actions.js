"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";
import { buatDeskripsiProduk } from "@/lib/gemini-deskripsi";

export async function requireAuth() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Silakan masuk terlebih dahulu."));
  }

  return { supabase, user };
}

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi."));
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toString().trim(),
    password: password.toString(),
  });

  if (error) {
    let pesan = error.message;
    if (error.message?.includes("Invalid login credentials")) {
      pesan = "Email atau password salah.";
    } else if (error.message?.includes("Email not confirmed")) {
      pesan = "Email belum dikonfirmasi.";
    }
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export { keluar as logout };

export async function gantiPassword(formData) {
  const passwordBaru = formData.get("password_baru")?.toString() || "";
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString() || "";

  const { supabase } = await requireAuth();

  if (!passwordBaru || !konfirmasiPassword) {
    redirect("/admin/password?error=" + encodeURIComponent("Semua kolom wajib diisi."));
  }

  if (passwordBaru.length < 8) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru minimal 8 karakter.")
    );
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru dan konfirmasi password tidak sama.")
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent(error.message || "Gagal mengganti password.")
    );
  }

  redirect(
    "/admin/password?success=" +
      encodeURIComponent("Password berhasil diganti.")
  );
}

export { gantiPassword as ubahPassword };

export async function tambahProduk(formData) {
  const { supabase } = await requireAuth();

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      "/admin/produk/baru?error=" + encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  if (!hargaRaw || isNaN(Number(hargaRaw))) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent("Harga harus berupa angka yang valid.")
    );
  }

  const harga = parseInt(hargaRaw, 10);
  if (harga < 0) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent("Harga tidak boleh negatif.")
    );
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent(error.message || "Gagal menambahkan produk.")
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(
    "/admin?success=" + encodeURIComponent("Produk berhasil ditambahkan.")
  );
}

export { tambahProduk as createProduct };

export async function buatDeskripsiDenganAI(formData) {
  await requireAuth();

  const fields = ["nama", "kategori", "informasi_ai", "karakteristik_ai"];
  const values = Object.fromEntries(
    fields.map((field) => [field, formData.get(field)])
  );

  if (
    Object.values(values).some(
      (value) => value !== null && typeof value !== "string"
    )
  ) {
    return { error: "Informasi produk tidak valid." };
  }

  return buatDeskripsiProduk({
    nama: values.nama || "",
    kategori: values.kategori || "",
    informasi: values.informasi_ai || "",
    karakteristik: values.karakteristik_ai || "",
  });
}

export async function hapusProduk(formData) {
  const { supabase } = await requireAuth();
  const id = formData.get("id");

  if (
    typeof id !== "string" ||
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(Number(id))
  ) {
    redirect("/admin?error=" + encodeURIComponent("ID produk tidak valid."));
  }

  const idAngka = Number(id);
  const { data: produk, error: cariError } = await supabase
    .from("produk")
    .select("id")
    .eq("id", idAngka)
    .maybeSingle();

  if (cariError) {
    redirect(
      "/admin?error=" +
        encodeURIComponent("Terjadi kesalahan saat menghapus produk. Silakan coba lagi.")
    );
  }

  if (!produk) {
    redirect(
      "/admin?error=" +
        encodeURIComponent("Produk tidak ditemukan atau sudah dihapus.")
    );
  }

  const { data: produkDihapus, error: hapusError } = await supabase
    .from("produk")
    .delete()
    .eq("id", idAngka)
    .select("id")
    .maybeSingle();

  if (hapusError) {
    redirect(
      "/admin?error=" +
        encodeURIComponent("Terjadi kesalahan saat menghapus produk. Silakan coba lagi.")
    );
  }

  if (!produkDihapus) {
    redirect(
      "/admin?error=" +
        encodeURIComponent("Produk tidak ditemukan atau sudah dihapus.")
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${idAngka}`);
  redirect(
    "/admin?success=" + encodeURIComponent("Produk berhasil dihapus.")
  );
}

export { hapusProduk as deleteProduct };

export async function ubahProduk(id, formData) {
  const { supabase } = await requireAuth();

  const idAngka = Number(id);
  if (!id || isNaN(idAngka)) {
    redirect(
      "/admin?error=" + encodeURIComponent("ID produk tidak valid.")
    );
  }

  // Pastikan produk dengan id ini memang ada
  const { data: produkAda, error: cariError } = await supabase
    .from("produk")
    .select("id")
    .eq("id", idAngka)
    .maybeSingle();

  if (cariError || !produkAda) {
    redirect(
      "/admin?error=" + encodeURIComponent("Produk tidak ditemukan.")
    );
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  if (!hargaRaw || isNaN(Number(hargaRaw))) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Harga harus berupa angka yang valid.")
    );
  }

  const harga = parseInt(hargaRaw, 10);
  if (harga < 0) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Harga tidak boleh negatif.")
    );
  }

  const { error } = await supabase
    .from("produk")
    .update({ nama, harga, kategori, foto_url, deskripsi })
    .eq("id", idAngka);

  if (error) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent(error.message || "Gagal menyimpan perubahan.")
    );
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect(
    "/admin?success=" + encodeURIComponent("Produk berhasil diubah.")
  );
}

export { ubahProduk as updateProduct };
