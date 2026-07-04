"use client";

import React, { useEffect, useState } from "react";
import NavigationMenu from "@/components/template/NavigationMenu";
import Header from "@/components/template/Header";

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

  // 1. STATE MANAGEMENT BARU
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Status visual lebar saat ini
  const [isMiniMode, setIsMiniMode] = useState(false); // Status permanen klik tombol

  // const [menus, setMenus] = useState<MenuItem[]>([]);
  // useEffect(() => {
  //   async function fetchMenu() {
  //     try {
  //       // Panggil API Route internal menggunakan metode POST demi keamanan
  //       const response = await fetch("/api/menu", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       const result = await response.json();

  //       if (result.success) {
  //         setMenus(result.data);
  //       }
  //     } catch (error) {
  //       console.error("Gagal memuat menu di sisi klien:", error);
  //     }
  //   }

  //   fetchMenu();
  // }, []);


  const menuItems = [
    { name: "Beranda", href: "/home", icon: "🏠" },
    {
      name: "Laporan Booking",
      href: "/home/reports",
      icon: "📊",
      children: [
        {
          name: "Laporan Harian",
          href: "/home/reports/daily",
          // Grandchild (Child di dalam child)
          children: [
            { name: "Laporan Reguler", href: "/home/reports/daily/regular" },
            { name: "Laporan VIP", href: "/home/reports/daily/vip" },
          ],
        },
        { name: "Laporan Bulanan", href: "/home/reports/monthly" },
      ],
    },
    {
      name: "Manajemen Kuota",
      href: "/home/quota",
      icon: "🚢",
      children: [
        {
          name: "kuota Harian",
          href: "/home/reports/daily",
          // Grandchild (Child di dalam child)
          children: [
            { name: "kuota kendaraan", href: "/home/reports/daily/regular" },
            { name: "kuota penumpang", href: "/home/reports/daily/vip" },
          ],
        },
        { name: "parkir kuota", href: "/home/reports/monthly" },
      ],
    },

    {
      name: "Port Management",
      href: "#",
      icon: "🚢",
      children: [
        {
          name: "Pelabuhan",
          href: "#2",
          // Grandchild (Child di dalam child)
          children: [
            { name: "Pelabuhan", href: "/port" },
            { name: "Pelabuhan Cabang", href: "/port_branch" },
          ],
        },
      ],
    },
  ];

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
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      {/* Sensor hover dipasang menggunakan onMouseEnter dan onMouseLeave */}
      <aside
        className={`hidden md:flex md:flex-col fixed inset-y-0 bg-slate-900 text-white z-30 transition-all duration-300 shadow-xl ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo / Nama Aplikasi & Tombol Toggle */}
        <div
          className={`flex h-16 items-center border-b border-slate-800 bg-slate-950 px-4 ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isSidebarOpen && (
            <span className="text-lg font-bold tracking-wider text-blue-400 animate-fade-in">
              SITOLAUT
            </span>
          )}

          <button
            type="button"
            onClick={handleToggleClick}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all duration-200 focus:outline-none flex items-center justify-center border border-slate-700/50"
            aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {/* Ikon SVG Dinamis: Otomatis Animasi Burger Menjadi Silang (X) */}
            <svg
              className="h-5 w-5 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        {/* Menu Navigasi dengan Fitur Pencarian */}
        {/* PANGGIL KELAS UTAMA UNTUK DESKTOP SIDEBAR */}
        <NavigationMenu
          menuItems={menuItems}
          isMobile={false}
          isSidebarOpen={isSidebarOpen}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-center text-xs overflow-hidden">
          <p className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
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
          operatorName="Operator ASDP Merak" // Opsional jika ingin diganti dinamis
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
          <div className="relative flex w-full max-w-xs flex-col bg-slate-900 p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <span className="text-md font-bold text-blue-400">SITOLAUT</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <NavigationMenu
              menuItems={menuItems}
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
