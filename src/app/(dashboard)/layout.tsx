"use client";

import React, { useEffect, useState } from "react";
import NavigationMenu from "@/components/template/NavigationMenu";
import Header from "@/components/template/Header";
import Skeleton from "@/components/ui/Skeleton";
import Notification from "@/components/ui/Notification";
import { useNotificationStore } from "@/store/useNotificationStore";

interface MenuItem {
    name: string;
    href: string;
    icon?: string; // Optional karena child biasanya tidak pakai icon
    children?: MenuItem[]; // Struktur rekursif (array dari MenuItem itu sendiri)
}

function hasSearchMatch(item: MenuItem, query: string): boolean {
    if (!query) return true;

    const normalizedQuery = query.toLowerCase();
    const matchCurrent = item.name.toLowerCase().includes(normalizedQuery);
    const matchChildren = item.children?.some((child) =>
        hasSearchMatch(child, query),
    );

    return matchCurrent || !!matchChildren;
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toastList = useNotificationStore((state) => state.toastList);
    const handleClose = useNotificationStore((state) => state.handleClose);
    const triggerNotification = useNotificationStore(
        (state) => state.triggerNotification,
    );

    // 1. STATE MANAGEMENT BARU
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Status visual lebar saat ini
    const [isMiniMode, setIsMiniMode] = useState(false); // Status permanen klik tombol
    const [isLoading, setIsLoading] = useState(true);

    const [menus, setMenus] = useState<MenuItem[]>([]);
    useEffect(() => {
        async function fetchMenu() {
            try {
                // Panggil API Route internal menggunakan metode POST demi keamanan

                const response = await fetch("/api/menu", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const result = await response.json();
                if (result.success) {
                    setMenus(result.data);
                    setIsLoading(false);
                } else {
                    triggerNotification(result.message, `warning`);
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan jaringan atau sistem.";
                triggerNotification(errorMessage, `error`);
            }
        }

        fetchMenu();
    }, []);

    // 2. FUNGSI LOGIKA HOVER SENSOR
    const handleMouseEnter = () => {
        // Jika user mengeklik tombol tutup (mini mode aktif), buka sidebar saat disentuh kursor
        if (isMiniMode) {
            setIsSidebarOpen(true);
        }
    };

    const handleMouseLeave = () => {
        // Kembalikan ke posisi menutup jika kursor keluar dari area sidebar
        if (isMiniMode) {
            setIsSidebarOpen(false);
        }
    };

    const handleToggleClick = () => {
        // Membalikkan keadaan mode klik tombol manual
        const newMode = !isMiniMode;
        setIsMiniMode(newMode);
        setIsSidebarOpen(!newMode);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-950">
            {/* CONTAINER UTAMA: Mengunci posisi di pojok kanan atas dan menyusun baris ke bawah */}
            <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 w-full max-w-sm pointer-events-none ">
                {toastList.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto w-full">
                        <Notification
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => handleClose(toast.id)}
                        />
                    </div>
                ))}
            </div>
            {/* ================= SIDEBAR (DESKTOP) ================= */}
            {/* Sensor hover dipasang menggunakan onMouseEnter dan onMouseLeave */}
            <aside
                className={`hidden md:flex md:flex-col fixed inset-y-0 bg-white text-slate-800 z-30 transition-all duration-300 border-r border-slate-100 shadow-sm ${
                    isSidebarOpen ? "w-64" : "w-20"
                }`}
            >
                {/* Logo / Nama Aplikasi & Tombol Toggle */}
                <div
                    className={`flex h-16 items-center border-b border-slate-100 bg-white px-4 ${
                        isSidebarOpen ? "justify-between" : "justify-center"
                    }`}
                >
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2 animate-fade-in select-none">
                            {/* Wadah Ikon: Latar belakang putih dengan border abu-abu yang sangat tipis dan halus */}
                            <div className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 shadow-sm rounded-lg flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-[#459fda]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 3.06a8.003 8.003 0 0 0-7.94 7.94H11V3.06Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 3.06A8.003 8.003 0 0 1 20.94 11H13V3.06Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20.475 13A8.001 8.001 0 0 1 3.525 13H20.475Z"
                                    />
                                </svg>
                            </div>

                            {/* Ukuran Teks: Menggunakan text-slate-800 yang kontras dan bersih di atas background putih */}
                            <div className="flex flex-col text-left font-sans">
                                <span className="text-xs font-bold leading-tight tracking-tight text-slate-800">
                                    Merchant
                                </span>
                                <span className="text-xs font-bold leading-tight tracking-tight text-slate-800">
                                    Management
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tombol Toggle: Diubah dari warna gelap ke abu-abu terang modern agar seimbang dengan background putih */}
                    <button
                        type="button"
                        onClick={handleToggleClick}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all duration-200 focus:outline-none flex items-center justify-center border border-slate-200/60"
                        aria-label={
                            isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"
                        }
                    >
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
                </div>

                {/* Menu Navigasi dengan Fitur Pencarian */}
                {/* PANGGIL KELAS UTAMA UNTUK DESKTOP SIDEBAR */}
                {isLoading ? (
                    // Tampilkan UI Skeleton saat loading
                    <Skeleton
                        totalCount={10}
                        align="left"
                        rows={3}
                        variant="skeleton-only"
                    />
                ) : (
                    <NavigationMenu
                        menuItems={menus}
                        isMobile={false}
                        isSidebarOpen={isSidebarOpen}
                        handleMouseEnter={handleMouseEnter}
                        handleMouseLeave={handleMouseLeave}
                    />
                )}
                {/* Footer Sidebar */}
                <div className="p-4 border-t border-slate-100 bg-white text-center text-xs overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-sans tracking-wide whitespace-nowrap">
                        {isSidebarOpen ? "ASDP Versi 2.0" : "V2"}
                    </p>
                </div>
            </aside>

            {/* ================= AREA KONTEN UTAMA ================= */}
            {/* Jarak padding-left konten utama diatur berdasarkan isMiniMode (bukan isSidebarOpen) */}
            {/* Ini bertujuan agar posisi konten utama tidak bergeser/terdistraksi ketika kursor masuk-keluar */}
            <div
                className={`flex flex-col flex-1 transition-all duration-300 ${
                    isMiniMode ? "md:pl-20" : "md:pl-64"
                }`}
            >
                {/* ================= HEADER ATAS ================= */}
                <Header
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    operatorName="Web Admin ASDP" // Opsional jika ingin diganti dinamis
                />

                <main className="flex-1 relative">{children}</main>
            </div>

            {/* ================= SIDEBAR MENU (MOBILE OVERLAY) ================= */}

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <button
                        type="button"
                        aria-label="Tutup menu"
                        className="fixed inset-0 w-full h-full bg-slate-900/60 backdrop-blur-sm cursor-default"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative flex w-full max-w-xs flex-col bg-white p-4 text-slate-800 border-r border-slate-100 shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2 animate-fade-in select-none">
                                {/* Wadah Ikon: Latar belakang putih dengan border abu-abu yang sangat tipis dan halus */}
                                <div className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 shadow-sm rounded-lg flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 text-[#459fda]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11 3.06a8.003 8.003 0 0 0-7.94 7.94H11V3.06Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 3.06A8.003 8.003 0 0 1 20.94 11H13V3.06Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20.475 13A8.001 8.001 0 0 1 3.525 13H20.475Z"
                                        />
                                    </svg>
                                </div>

                                {/* Ukuran Teks: Menggunakan text-slate-800 yang kontras dan bersih di atas background putih */}
                                <div className="flex flex-col text-left font-sans">
                                    <span className="text-xs font-bold leading-tight tracking-tight text-slate-800">
                                        Merchant
                                    </span>
                                    <span className="text-xs font-bold leading-tight tracking-tight text-slate-800">
                                        Management
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg p-1 text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <NavigationMenu
                            menuItems={menus}
                            isMobile={true}
                            isSidebarOpen={isSidebarOpen}
                            handleMouseEnter={handleMouseEnter}
                            handleMouseLeave={handleMouseLeave}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
