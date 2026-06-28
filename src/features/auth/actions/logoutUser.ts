"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  const cookieStore = await cookies();
  
  // Hapus cookie sesi yang mendasari proteksi middleware
  cookieStore.delete("session_token");

  // Alihkan pengguna kembali ke halaman login utama
  redirect("/login");
}
