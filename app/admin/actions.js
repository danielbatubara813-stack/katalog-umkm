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

