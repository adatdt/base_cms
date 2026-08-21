import React from "react";
import Image from "next/image";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Tag utama pembungkus layar penuh
        <main className="relative flex min-h-screen w-full overflow-hidden">
            <div className="relative z-20 flex w-full min-h-screen justify-start">
                {/* 1. KOTAK PUTIH MENTOK KIRI (Tepat Setengah Layar: 50%) */}
                <div className="relative w-full lg:w-1/2 min-h-screen bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-center shadow-2xl border-r border-slate-200/80 overflow-y-auto">
                    {/* SISIPAN GAMBAR IKON / LOGO DI POJOK KIRI ATAS */}
                    <div className="absolute top-8 left-4 sm:left-6 md:left-8">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/logo-asdp.png"
                                alt="ASDP Logo Icon"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Pembungkus Konten Internal (Form & Header) */}
                    <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-8 pt-12">
                        {/* Halaman /login atau /register akan dimuat di sini */}
                        <div className="relative z-30 w-full">{children}</div>
                    </div>
                </div>

                <div className="hidden lg:flex lg:w-1/2 min-h-screen items-center justify-center p-12 text-white bg-black/10 backdrop-blur-[1px] relative overflow-hidden">
                    <Image
                        src="/images/bg_image.png"
                        alt="ASDP Payment Collection Background"
                        fill
                        priority
                        className="object-cover object-left z-0"
                    />
                </div>
            </div>
        </main>
    );
}
