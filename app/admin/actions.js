"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

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

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login?error=" + encodeURIComponent("Silakan masuk terlebih dahulu."));
  }

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
