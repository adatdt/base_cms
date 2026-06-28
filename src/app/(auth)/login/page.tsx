import LoginForm from "@/features/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Sitolaut",
  description: "Masuk ke akun Sitolaut Anda",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-800">Selamat Datang Kembali</h1>
        <p className="text-xs text-slate-500">Silakan masukkan akun Anda untuk melanjutkan</p>
      </div>
      
      {/* Memanggil UI Form Utama dari Modul Auth */}
      <LoginForm />
    </div>
  );
}
