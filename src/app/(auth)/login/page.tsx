import LoginForm from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | ASDP",
    description: "Masuk ke akun ASDP Anda",
};

export default function LoginPage() {
    return (
        <div>
            <div className=" text-left pb-10">
                <p className="text-sm font-semibold text-blue-800 mb-1">
                    Halo,
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    Selamat datang kembali{" "}
                    <span className="inline-block origin-bottom animate-pulse">
                        👋
                    </span>
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    di ASDP Payment Collection
                </p>
            </div>
            {/* Memanggil UI Form Utama dari Modul Auth */}
            <LoginForm />
        </div>
    );
}
