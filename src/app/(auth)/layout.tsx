import React from "react";
import Image from "next/image";
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // 1. Ubah bg-slate-100 menjadi 'relative overflow-hidden'
        <main className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            {/* 2. Sisipkan Komponen Gambar Next.js sebagai Latar Belakang */}
            <Image
                src="/images/bg_image.png" // Pastikan file gambar ada di public/images/
                alt="ASDP Payment Collection Background"
                fill // Mengisi seluruh area tag <main>
                priority // Dioptimalkan untuk loading instan (LCP)
                className="object-cover object-center z-0" // Berada di lapisan paling belakang
            />

            {/* 3. Efek Overlay Transparan (Agar gambar tidak terlalu terang dan teks tetap terbaca) */}
            <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[1px] z-10"></div>

            {/* 4. Kotak Formulir Utama (Diberi kelas 'relative z-20' agar berada di atas gambar) */}
            <div className="relative z-20 w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-slate-200/80">
                {/* Header Bersama untuk Halaman Auth */}
                <div className="text-center">
                    <h2 className="text-4xl font-black tracking-tight text-blue-900">
                        ASDP
                    </h2>
                    <p className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
                        Hub Pelabuhan & Penyeberangan
                    </p>
                </div>

                {/* Halaman /login atau /register akan dimuat di sini */}
                <div className="relative z-30">{children}</div>
            </div>
        </main>
    );
}
