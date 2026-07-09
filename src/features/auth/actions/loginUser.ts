"use server";

import { z } from "zod";
import { loginSchema } from "../schemas/login-schema";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyTextCaptcha } from "@/utils/captcha"; // 🌟 Impor fungsi validasi captcha

export type ActionState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    captcha?: string[]; // 🌟 Tambahkan tipe error captcha
  };
};

export async function loginUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 🌟 A. AMBIL DATA INPUT CAPTCHA & JAWABAN ASLI TERENKRIPSI
  const userCaptchaInput = formData.get("user_captcha") as string;
  const encryptedCaptchaAnswer = formData.get("encrypted_captcha") as string;

  // VALIDASI IF: Pastikan user mengisi kolom captcha
  if (!userCaptchaInput || userCaptchaInput.trim().length === 0) {
    return {
      success: false,
      message: "Validasi gagal. Mohon isi jawaban Captcha.",
      errors: { captcha: ["Jawaban Captcha wajib diisi."] },
    };
  }

  // 🌟 B. VERIFIKASI JAWABAN CAPTCHA SECARA MANDIRI
  const isCaptchaValid = verifyTextCaptcha(
    userCaptchaInput,
    encryptedCaptchaAnswer,
  );

  if (!isCaptchaValid) {
    return {
      success: false,
      message: "Validasi gagal. Jawaban Captcha yang Anda masukkan salah.",
      errors: { captcha: ["Jawaban salah, silakan coba lagi."] },
    };
  }

  // 1. Ambil data kredensial dari object FormData
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 2. Validasi menggunakan Zod
  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
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

    // Set Cookie untuk User Group
    cookieStore.set("user_group", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TWO_HOURS_IN_SECONDS,
      path: "/",
    });
  } catch (error) {
    console.log(`Exception while doing something: ${error}`);
    return { success: false, message: "Terjadi kesalahan server." };
  }

  redirect("/home");
}
