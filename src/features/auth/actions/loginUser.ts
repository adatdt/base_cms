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

export async function loginUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
    const cookieStore = await cookies();
    cookieStore.set("session_token", "dummy-jwt-token-sitolaut", {
      httpOnly: true, // Amankan cookie dari pencurian via JavaScript (XSS)
      secure: process.env.NODE_ENV === "production", // Hanya lewat HTTPS di production
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // Expired dalam 1 hari (dalam hitungan detik)
      path: "/", // Berlaku untuk semua rute
    });

  } catch (error) {
     console.log(`Exception while doing something: ${error}`);
    return { success: false, message: "Terjadi kesalahan server." };
  }

  redirect("/home");
}
