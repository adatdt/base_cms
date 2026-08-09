"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/features/auth/actions/logoutUser";
import { DropdownBtn } from "../ui/DropdownBtn";
import CrudIcons from "../ui/CrudIcons";

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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
            {/* Tombol Hamburger Menu (Hanya Tampil di Layar HP) */}
            <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 md:hidden focus:outline-none border border-transparent active:bg-slate-100"
                title="Buka Menu"
            >
                {/* Mengganti simbol teks biasa dengan ikon hamburger mini yang lebih modern */}
                <svg
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5v14"
                    />
                </svg>
            </button>

            {/* Identitas Halaman / Breadcrumb Teks */}
            <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-slate-500 font-sans tracking-wide">
                    {getBreadcrumbTitle()}
                </h1>
            </div>

            {/* Sisi Kanan: Profil Operator & Tombol Keluar */}
            <div className="flex items-center gap-4">
                {/* Tombol Keluar: Dibuat bersih menyatu dengan tema baru */}
                <DropdownBtn
                    variant="default"
                    size="sm"
                    isCircle={true} // 🌟 Cukup tambahkan ini agar tombolnya otomatis bulat simetris h-[32px] w-[32px]
                    className="text-slate-400 hover:text-slate-600"
                    trigger={<CrudIcons name="bell" size={20} />}
                    items={[
                        {
                            label: "Keluar",
                            fontWeight: "normal",
                            fontSize: "xs",
                            onClick: async () => {
                                await logoutUser();
                            },
                        },
                    ]}
                    widthClass="w-48"
                    alignClass="right-0"
                />
            </div>
        </header>
    );
}
