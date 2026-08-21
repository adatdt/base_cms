"use client";

import { useActionState, useEffect, useState, useCallback } from "react";
import { loginUser, ActionState } from "../actions/loginUser";
import { getNewCaptcha } from "../actions/getNewCaptcha"; // 🌟 Impor generator action
import Icons from "@/components/ui/Icons";
import { InputText } from "@/components/ui/InputText";
import Btn from "@/components/ui/Btn";

const initialState: ActionState = {
    success: false,
    message: "",
};

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(
        loginUser,
        initialState,
    );

    console.log(state);

    // 🌟 State lokal untuk menampung soal teks dan kode enkripsi jawaban captcha
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [encryptedAnswer, setEncryptedAnswer] = useState("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

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
        <form action={formAction} className="space-y-4 w-full">
            {/* Alert Error / Sukses Global */}
            {state.message && (
                <div
                    className={`p-3 text-sm rounded-xl border ${
                        state.success
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                >
                    {state.message}
                </div>
            )}

            {/* Input Email (Label: Email, Warna Teks Label Lembut, Input Lengkung Rapi) */}
            <div className="space-y-1.5">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-600"
                >
                    Email
                </label>
                <InputText
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="email"
                    placeholder="Masukkan email"
                    inputSize="sm"
                    hasError={!!state.errors?.email}
                />

                {state.errors?.email && (
                    <p className="mt-1 text-xs text-rose-600">
                        {state.errors.email[0]}
                    </p>
                )}
            </div>

            {/* Input Password (Label: Password, Ditambahkan Tombol Ikon Mata Sesuai Gambar) */}
            <div className="space-y-1.5">
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-600"
                >
                    Password
                </label>
                <div className="relative w-full">
                    <InputText
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        inputSize="sm"
                        hasError={!!state.errors?.password}
                    />

                    {/* Tombol Ikon Mata Sesuai Desain Gambar */}
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <Icons name="eyes" size={25} />
                        ) : (
                            <Icons name="eyes-off" size={25} />
                        )}
                    </button>
                </div>
                {state.errors?.password && (
                    <p className="mt-1 text-xs text-rose-600">
                        {state.errors.password[0]}
                    </p>
                )}
            </div>

            {/* Lupa Password Samping Kanan-Kiri Sesuai Gambar */}
            <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-600">Lupa password?</span>
                <a
                    href="/dahboard"
                    className="text-blue-900 font-bold underline underline-offset-4 decoration-1"
                >
                    Klik Disini
                </a>
            </div>

            {/* Blok Konstruksi Captcha (Menghapus container abu-abu bg-slate-50, diubah polos menyamping) */}
            <div className="space-y-2 pt-2">
                <label
                    htmlFor="user_captcha"
                    className="block text-sm font-medium text-slate-600"
                >
                    Captcha
                </label>

                <input
                    type="hidden"
                    name="encrypted_captcha"
                    value={encryptedAnswer}
                />

                {/* Susunan 3 Kolom Menyamping: Input Teks - Box Gambar Soal - Tombol Refresh */}
                <div className="flex items-center gap-3 w-full">
                    {/* 1. Kolom Kiri: Kolom Input Jawaban */}
                    <div className="flex-1">
                        <InputText
                            id="user_captcha"
                            name="user_captcha"
                            type="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder="Masukkan captcha"
                            inputSize="sm"
                            hasError={!!state.errors?.captcha}
                        />
                    </div>

                    {/* 2. Kolom Tengah: Box Teks Soal Gambar Captcha */}
                    <div className="shrink-0">
                        <span className="inline-flex items-center justify-center text-center text-sm font-bold text-slate-700 bg-white px-5 py-3 border border-slate-200 rounded-lg select-none tracking-widest italic line-through decoration-slate-400 decoration-1 h-9 min-w-30 font-mono">
                            {captchaQuestion || "xk8FB"}
                        </span>
                    </div>

                    {/* 3. Kolom Kanan: Tombol Segarkan Berwarna Biru dengan Ikon Panah Putar Lingkaran */}
                    <Btn
                        type="button"
                        onClick={refreshCaptcha}
                        disabled={isPending}
                        size="sm"
                        title="Segarkan Captcha"
                        className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition disabled:opacity-50 shrink-0 \ focus:outline-none"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-none active:rotate-180 transition-transform duration-300"
                        >
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                        </svg>
                    </Btn>
                </div>
                {state.errors?.captcha && (
                    <p className="mt-1 text-xs text-rose-600">
                        {state.errors.captcha[0]}
                    </p>
                )}
            </div>

            {/* Tombol Submit Utama Berwarna Cerah Solid Bergradasi Halus Biru Langit */}
            <div className="pt-2">
                <Btn
                    type="submit"
                    isLoading={isPending}
                    variant="success-blue"
                    fullWidth={true}
                >
                    {isPending ? "Memproses..." : "Masuk"}
                </Btn>
            </div>
        </form>
    );
}
