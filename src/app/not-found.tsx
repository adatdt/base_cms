"use client";

import React from "react";
import Link from "next/link";
import Btn from "@/components/ui/Btn";

export default function DashboardNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-slate-800 bg-white border border-slate-100 rounded-2xl shadow-sm">
            {/* Bagian Visual */}
            <div className="text-4xl font-extrabold text-blue-600/20 bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center select-none mb-4">
                404
            </div>

            {/* Informasi Teks */}
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
                Konten Tidak Ditemukan
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 text-center max-w-xs">
                Maaf, modul operasional atau data halaman dashboard yang Anda
                cari tidak tersedia atau telah dipindahkan.
            </p>

            {/* Tombol Aksi Navigasi Kembali */}
            <div className="mt-5">
                <Link href="/home">
                    <Btn variant="default" size="md">
                        Kembali ke Dashboard
                    </Btn>
                </Link>
            </div>
        </div>
    );
}
