"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/features/auth/actions/logoutUser";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  operatorName?: string;
  statusText?: string;
}

export default function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  operatorName = "Operator ASDP",
  statusText = "Online",
}: Readonly<HeaderProps>) {
  const pathname = usePathname();

  // Fungsi untuk memformat judul breadcrumb di header secara dinamis
  const getBreadcrumbTitle = () => {
    if (pathname === "/home" || pathname === "/") {
      return " HOME";
    }

    // Mengubah rute url seperti '/port-branch' menjadi 'OPERATIONAL / PORT-BRANCH'
    const cleanPath = pathname.replace(/^\//, "").toUpperCase();
    return `${cleanPath}`;
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      {/* Tombol Hamburger Menu (Hanya Tampil di Layar HP) */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
        title="Buka Menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Identitas Halaman / Breadcrumb Teks */}
      <div className="hidden sm:block">
        <h1 className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
          {getBreadcrumbTitle()}
        </h1>
      </div>

      {/* Sisi Kanan: Profil Operator & Tombol Keluar */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">{operatorName}</p>
          <p className="text-[10px] text-emerald-600 font-medium">
            {statusText}
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logoutUser();
          }}
          className="rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 px-3 py-2 text-xs font-medium border border-slate-200 transition focus:outline-none"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
