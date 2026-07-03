"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Interface untuk menyamakan tipe data menu dari database Anda
export interface MenuItem {
  id?: string;
  name: string;
  href: string; // Menyambung ke properti 'slug' atau 'url' database Anda
  icon?: string | React.ReactNode;
  children?: MenuItem[];
}

interface NavigationMenuProps {
  menuItems: MenuItem[];
  isMobile?: boolean; // Pembeda mode layout
  isSidebarOpen?: boolean; // Khusus Desktop Sidebar
  setIsMobileMenuOpen?: (open: boolean) => void; // Khusus Mobile Menu Drawer
  handleMouseEnter?: () => void; // Khusus Desktop Sidebar
  handleMouseLeave?: () => void; // Khusus Desktop Sidebar
}

export default function NavigationMenu({
  menuItems,
  isMobile = false,
  isSidebarOpen = true,
  setIsMobileMenuOpen,
  handleMouseEnter,
  handleMouseLeave,
}: Readonly<NavigationMenuProps>) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Fungsi toggle buka-tutup dropdown menu anak
  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  // Fungsi pencarian rekursif yang akurat untuk menyaring teks kecocokan menu
  const hasSearchMatch = (item: MenuItem, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();

    // Cek apakah menu saat ini cocok
    const currentMatch = item.name.toLowerCase().includes(lowerQuery);
    if (currentMatch) return true;

    // Cek apakah salah satu menu anak atau cucu ada yang cocok
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => hasSearchMatch(child, query));
    }

    return false;
  };

  // Inner function untuk merender baris anak menu (Level 2) dan cucu menu (Level 3)
  const renderChildMenuRow = (child: MenuItem) => {
    const isChildActive = pathname === child.href;
    const hasGrandchildren = child.children && child.children.length > 0;
    const isChildOpen = !!openMenus[child.href];

    // Menyaring daftar cucu (Level 3) berdasarkan kata kunci pencarian
    const filteredGrandchildren =
      child.children?.filter((grandchild) =>
        grandchild.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [];

    return (
      <div key={child.href} className="space-y-1">
        {/* ITEM LINK CHILD (LEVEL 2) */}
        <Link
          href={hasGrandchildren ? "#" : child.href}
          onClick={(e) => {
            if (hasGrandchildren) {
              e.preventDefault();
              toggleMenu(child.href);
            } else if (isMobile && setIsMobileMenuOpen) {
              setIsMobileMenuOpen(false);
            }
          }}
          className={`flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            isChildActive
              ? "text-blue-500 bg-slate-800/50"
              : "text-slate-500 hover:text-white hover:bg-slate-800/30"
          }`}
        >
          <span className="whitespace-nowrap">{child.name}</span>

          {/* Indikator Panah Level 2 CSS Murni */}
          {hasGrandchildren && (
            <span
              className={`inline-block w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[3.5px] border-t-slate-600 transition-transform duration-200 ${
                isChildOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </Link>

        {/* RENDER GRANDCHILDREN (LEVEL 3) */}
        {(isChildOpen || searchQuery) && filteredGrandchildren.length > 0 && (
          <div className="pl-4 space-y-1 border-l border-slate-800 ml-3 transition-all duration-200">
            {filteredGrandchildren.map((grandchild) => {
              const isGrandchildActive = pathname === grandchild.href;

              return (
                <Link
                  key={grandchild.href}
                  href={grandchild.href}
                  onClick={() => {
                    if (isMobile && setIsMobileMenuOpen) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`block py-1.5 px-3 text-[11px] font-medium rounded-md transition-all ${
                    isGrandchildActive
                      ? "text-blue-400 bg-slate-800/20"
                      : "text-slate-600 hover:text-slate-300"
                  }`}
                >
                  {grandchild.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Kondisi penentu ukuran layout sidebar desktop vs mobile penuh
  const showSidebarFeatures = isMobile || isSidebarOpen;

  return (
    <nav
      onMouseEnter={isMobile ? undefined : handleMouseEnter}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className={`flex-1 space-y-4 py-4 overflow-y-auto transition-all ${
        showSidebarFeatures ? "px-4" : "px-2"
      }`}
    >
      {/* 1. INPUT PENCARIAN (Hanya sembunyi jika di desktop dan sidebar sedang mengecil) */}
      {showSidebarFeatures && (
        <div className="px-1 mb-2 animate-fade-in">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
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

      {/* 2. DAFTAR RENDERING MENU BERDASARKAN HASIL FILTER */}
      <div className="space-y-1">
        {menuItems
          .filter((item) => hasSearchMatch(item, searchQuery))
          .map((item) => {
            const isActive = pathname === item.href;
            const hasChildren = item.children && item.children.length > 0;
            const isMenuOpen = !!openMenus[item.href];

            // Filter Level 2 (Children)
            const filteredChildren =
              item.children?.filter((child) =>
                hasSearchMatch(child, searchQuery),
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
                      } else if (isMobile && setIsMobileMenuOpen) {
                        setIsMobileMenuOpen(false); // Tutup drawer jika di mobile
                      }
                    }}
                    title={showSidebarFeatures ? undefined : item.name}
                    className={`flex items-center justify-between w-full gap-3 py-3 text-sm font-medium rounded-xl transition-all ${
                      showSidebarFeatures ? "px-4" : "px-0 justify-center"
                    } ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base shrink-0">{item.icon}</span>
                      {showSidebarFeatures && (
                        <span className="whitespace-nowrap transition-opacity duration-200">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Indikator Panah Level 1 */}
                    {showSidebarFeatures && hasChildren && (
                      <span
                        className={`inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-500 mr-2 transition-transform duration-200 ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                </div>

                {/* LEVEL 2 & 3: Render Sub-Menu Anak dan Cucu */}
                {showSidebarFeatures &&
                  (isMenuOpen || searchQuery) &&
                  filteredChildren.length > 0 && (
                    <div className="pl-9 space-y-1 transition-all duration-200">
                      {filteredChildren.map((child) =>
                        renderChildMenuRow(child),
                      )}
                    </div>
                  )}
              </div>
            );
          })}
      </div>
    </nav>
  );
}
