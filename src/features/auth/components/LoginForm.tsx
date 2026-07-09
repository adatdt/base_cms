"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { loginUser, ActionState } from "../actions/loginUser";
import { getNewCaptcha } from "../actions/getNewCaptcha"; // 🌟 Impor generator action

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginUser,
    initialState,
  );

  // 🌟 State lokal untuk menampung soal teks dan kode enkripsi jawaban captcha
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [encryptedAnswer, setEncryptedAnswer] = useState("");

  // 🌟 Fungsi untuk mengambil soal captcha baru dari server secara aman
  const refreshCaptcha = useCallback(async () => {
    const newCaptcha = await getNewCaptcha();
    setCaptchaQuestion(newCaptcha.text);
    setEncryptedAnswer(newCaptcha.encryptedAnswer);
  }, []);

  // Ambil captcha pertama kali saat halaman dimuat
  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // Otomatis ganti soal captcha baru jika user gagal login
  useEffect(() => {
    if (!state.success && state.message) {
      refreshCaptcha();
    }
  }, [state, refreshCaptcha]);

  return (
    <form action={formAction} className="space-y-5">
      {/* Alert Error / Sukses Global */}
      {state.message && (
        <div
          className={`p-3 text-sm rounded-lg border ${
            state.success
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Input Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Alamat Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="contoh@sitolaut.id"
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-600 placeholder-slate-400 ${
            state.errors?.email
              ? "border-rose-400 focus:ring-rose-500"
              : "border-slate-300"
          }`}
        />
        {state.errors?.email && (
          <p className="mt-1 text-xs text-rose-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Input Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Kata Sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-600 placeholder-slate-400 ${
            state.errors?.password
              ? "border-rose-400 focus:ring-rose-500"
              : "border-slate-300"
          }`}
        />
        {state.errors?.password && (
          <p className="mt-1 text-xs text-rose-600">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        {/* Hidden input untuk menyisipkan kunci jawaban terenkripsi AES ke FormData */}
        <input type="hidden" name="encrypted_captcha" value={encryptedAnswer} />

        {/* 🌟 PERBAIKAN DI SINI: flex-row dengan gap-3 untuk menyusun menyamping secara penuh */}
        <div className="flex items-center justify-between gap-3 w-full">
          {/* 🌟 KOTAK TEKS: Ditambahkan 'flex-1' dan 'text-center' agar melebar mengikuti sisa ruang */}
          <span className="flex-1 inline-flex items-center justify-center text-center text-xl font-black text-slate-700 bg-white px-4 min-h-11.5 border border-slate-200 rounded-xl select-none tracking-widest italic line-through decoration-slate-400 decoration-2 shadow-sm font-mono">
            {captchaQuestion || ""}
          </span>

          {/* Tombol Refresh Captcha manual tetap berada di sudut kanan */}
          <button
            type="button"
            onClick={refreshCaptcha}
            disabled={isPending}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold transition cursor-pointer disabled:opacity-50 shrink-0 bg-white border border-slate-200 px-3 py-2.5 rounded-xl shadow-sm hover:bg-slate-50"
            title="Ganti Soal"
          >
            🔄 Ganti Soal
          </button>
        </div>

        {/* Input Teks Jawaban Pengguna */}
        <div>
          <input
            id="user_captcha"
            name="user_captcha"
            type="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Masukkan kode di atas..."
            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-600 placeholder-slate-400 bg-white tracking-wider ${
              state.errors?.captcha
                ? "border-rose-400 focus:ring-rose-500"
                : "border-slate-300"
            }`}
          />
          {state.errors?.captcha && (
            <p className="mt-1 text-xs text-rose-600">
              {state.errors.captcha[0]}
            </p>
          )}
        </div>
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Memverifikasi...
          </span>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
