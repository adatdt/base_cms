"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/features/auth/actions/logoutUser";

interface MenuItem {
  name: string;
  href: string;
  icon?: string; // Optional karena child biasanya tidak pakai icon
  children?: MenuItem[]; // Struktur rekursif (array dari MenuItem itu sendiri)
}


export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. STATE MANAGEMENT BARU
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Status visual lebar saat ini
  const [isMiniMode, setIsMiniMode] = useState(false);      // Status permanen klik tombol
  // TAMBAHKAN LINE INI:
  const [searchQuery, setSearchQuery] = useState(""); 

  // State untuk menyimpan menu mana yang terbuka (menggunakan href sebagai ID unik)
const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});

// Fungsi toggle untuk membuka/tutup dropdown
const toggleMenu = (href: string) => {
  setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
};

// Efek Otomatis: Jika user mengetik di pencarian, otomatis buka semua dropdown yang cocok
React.useEffect(() => {
  if (searchQuery) {
    const newOpenStates: { [key: string]: boolean } = {};
    const activateOpenStates = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && hasSearchMatch(item, searchQuery)) {
          newOpenStates[item.href] = true;
          activateOpenStates(item.children);
        }
      });
    };
    activateOpenStates(menuItems);
    setOpenMenus(newOpenStates);
  }
}, [searchQuery]);


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
          { name: "Laporan VIP", href: "/home/reports/daily/vip" }
        ]
      },
      { name: "Laporan Bulanan", href: "/home/reports/monthly" }
    ]
  },
  { name: "Manajemen Kuota", href: "/home/quota", icon: "🚢", children: [
      { 
        name: "kuota Harian", 
        href: "/home/reports/daily",
        // Grandchild (Child di dalam child)
        children: [
          { name: "kuota kendaraan", href: "/home/reports/daily/regular" },
          { name: "kuota penumpang", href: "/home/reports/daily/vip" }
        ]
      },
      { name: "parkir kuota", href: "/home/reports/monthly" }
    ]  },
     { name: "Port", href: "/port", icon: "🏠" },
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

  const hasSearchMatch = (item: MenuItem, query: string): boolean => {
  if (!query) return true;
  
  const matchCurrent = item.name.toLowerCase().includes(query.toLowerCase());
  
  // Menggunakan optional chaining (?) karena properti children bersifat opsional
  const matchChildren = item.children?.some((child) => hasSearchMatch(child, query));
  
  return matchCurrent || !!matchChildren;
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
        <div className={`flex h-16 items-center border-b border-slate-800 bg-slate-950 px-4 ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />

                </svg>
            </button>


        </div>
        
       {/* Menu Navigasi dengan Fitur Pencarian */}
<nav 
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave} 
  className={`flex-1 space-y-4 py-4 overflow-y-auto transition-all ${
    isSidebarOpen ? "px-4" : "px-2"
  }`}
>
  {/* 1. INPUT PENCARIAN (Hanya tampil jika sidebar terbuka lebar) */}
  {isSidebarOpen && (
    <div className="px-1 mb-2 animate-fade-in">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-xs">
          🔍
        </span>
        <input
          type="text"
          placeholder="Cari menu..."
          value={searchQuery} // Pastikan state 'searchQuery' sudah didefinisikan di atas
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        {/* Tombol hapus pencarian jika ada teks */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 hover:text-slate-300 text-[10px]"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )}

  {/* 2. DAFTAR MENU (Disaring otomatis berdasarkan query pencarian) */}
<div className="space-y-1">
  {menuItems
    .filter((item) => hasSearchMatch(item, searchQuery))
    .map((item) => {
      const isActive = pathname === item.href;
      const hasChildren = item.children && item.children.length > 0;
      const isMenuOpen = !!openMenus[item.href];
      
      // Filter level 2 berdasarkan query
      const filteredChildren = item.children?.filter(child => 
        hasSearchMatch(child, searchQuery)
      ) || [];

      return (
        <div key={item.href} className="space-y-1">
          {/* LEVEL 1: Menu Utama */}
          <div className="relative flex items-center justify-between group">
            <Link
              href={hasChildren ? "#" : item.href}
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  toggleMenu(item.href);
                }
              }}
              title={isSidebarOpen ? undefined : item.name}
              className={`flex items-center justify-between w-full gap-3 py-3 text-sm font-medium rounded-xl transition-all ${
                isSidebarOpen ? "px-4" : "px-0 justify-center"
              } ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="whitespace-nowrap transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </div>
              
              {/* Indikator Panah Level 1 */}
              {isSidebarOpen && hasChildren && (
                <span className={`text-xs transition-transform duration-200 text-slate-500 mr-1 ${isMenuOpen ? "rotate-180" : ""}`}>
                  🔽
                </span>
              )}
            </Link>
          </div>

          {/* LEVEL 2: Render Child jika Sidebar Terbuka & Dropdown Aktif */}
          {isSidebarOpen && (isMenuOpen || searchQuery) && filteredChildren.length > 0 && (
            <div className="pl-9 space-y-1 transition-all duration-200">
              {filteredChildren.map((child) => {
                const isChildActive = pathname === child.href;
                const hasGrandchildren = child.children && child.children.length > 0;
                const isChildOpen = !!openMenus[child.href];
                
                // Filter level 3 berdasarkan query
                const filteredGrandchildren = child.children?.filter(grandchild =>
                  grandchild.name.toLowerCase().includes(searchQuery.toLowerCase())
                ) || [];

                return (
                  <div key={child.href} className="space-y-1">
                    {/* Item Child Level 2 */}
                    <Link
                      href={hasGrandchildren ? "#" : child.href}
                      onClick={(e) => {
                        if (hasGrandchildren) {
                          e.preventDefault();
                          toggleMenu(child.href);
                        }
                      }}
                      className={`flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                        isChildActive
                          ? "text-blue-500 bg-slate-800/50"
                          : "text-slate-500 hover:text-white hover:bg-slate-800/30"
                      }`}
                    >
                      <span className="whitespace-nowrap">{child.name}</span>
                      
                      {/* Indikator Panah Level 2 */}
                      {hasGrandchildren && (
                        <span className={`text-[10px] transition-transform duration-200 text-slate-600 ${isChildOpen ? "rotate-180" : ""}`}>
                          🔽
                        </span>
                      )}
                    </Link>

                    {/* LEVEL 3: Render Grandchild (Hanya jika dropdown level 2 aktif) */}
                    {(isChildOpen || searchQuery) && filteredGrandchildren.length > 0 && (
                      <div className="pl-4 space-y-1 border-l border-slate-800 ml-3 transition-all duration-200">
                        {filteredGrandchildren.map((grandchild) => {
                          const isGrandchildActive = pathname === grandchild.href;
                          return (
                            <Link
                              key={grandchild.href}
                              href={grandchild.href}
                              className={`flex items-center py-1.5 px-3 text-[11px] font-medium rounded-md transition-all ${
                                isGrandchildActive
                                  ? "text-blue-400 font-semibold"
                                  : "text-slate-600 hover:text-slate-300"
                              }`}
                            >
                              <span className="whitespace-nowrap">{grandchild.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}

  {/* State cadangan jika menu tidak ditemukan saat diketik */}
  {isSidebarOpen && !menuItems.some(item => hasSearchMatch(item, searchQuery)) && (
    <p className="text-center text-xs text-slate-500 py-4 font-light">
      Menu tidak ditemukan
    </p>
  )}
</div>



</nav>


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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
          >
            <span className="text-xl">☰</span>
          </button>

          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-slate-500 font-mono tracking-wide">
              {pathname === "/home" ? "OPERATIONAL / HOME" : `OPERATIONAL ${pathname.toUpperCase()}`}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Operator ASDP</p>
              <p className="text-[10px] text-emerald-600 font-medium">Online</p>
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

        <main className="flex-1 relative">
          {children}
        </main>
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
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl ${
                      isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}
