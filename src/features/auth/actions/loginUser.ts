"use server";
import { z } from "zod";
import { loginSchema } from "../schemas/login-schema";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Tipe untuk feedback status ke UI Form
export type ActionState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1. Ambil data dari object FormData
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 2. Validasi menggunakan Zod
  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    // Menggunakan .format() sebagai pengganti .flatten().fieldErrors
    const flattened = z.flattenError(validatedFields.error);

    return {
      success: false,
      message: "Validasi gagal. Mohon periksa kembali input Anda.",
      errors: {
        email: flattened.fieldErrors.email,
        password: flattened.fieldErrors.password,
      },
    };
  }

  try {
    const isAuthValid = email === "admin@gmail.com" && password === "admin123";

    if (!isAuthValid) {
      return { success: false, message: "Email atau password salah." };
    }

    // 2. SET COOKIE SEBELUM REDIRECT
    // 2 Jam = 2 * 60 menit * 60 detik = 7200 detik
    const TWO_HOURS_IN_SECONDS = 2 * 60 * 60;

    const cookieStore = await cookies();

    // Set Cookie untuk Session Token
    cookieStore.set("session_token", "dummy-jwt-token-sitolaut", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TWO_HOURS_IN_SECONDS,
      path: "/",
    });

    // SEKARANG SUDAH DIAKOMODIR: Set Cookie untuk User Group
    // Ganti "dummy-group-operator" dengan data grup asli dari database/API login Anda (misal: el.user_group atau data.group)
    cookieStore.set("user_group", "1", {
      httpOnly: true, // Wajib true agar sama dengan middleware Anda
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TWO_HOURS_IN_SECONDS, // Umurnya sama-sama 2 jam
      path: "/",
    });
  } catch (error) {
    console.log(`Exception while doing something: ${error}`);
    return { success: false, message: "Terjadi kesalahan server." };
  }

  redirect("/home");
}
