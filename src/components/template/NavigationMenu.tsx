"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icons from "../ui/Icons";

export interface MenuItem {
    id?: string;
    name: string;
    href: string;
    icon?: string | React.ReactNode;
    children?: MenuItem[];
}

interface NavigationMenuProps {
    menuItems: MenuItem[];
    isMobile?: boolean;
    isSidebarOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
    handleMouseEnter?: () => void;
    handleMouseLeave?: () => void;
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

    // 1. FUNGSI PEMBANTU: Cek secara rekursif apakah modul/menu ini sedang diakses
    const isModuleActive = (item: MenuItem): boolean => {
        // Cocokkan langsung dengan href menu saat ini
        if (pathname === `/${item.href}` || pathname === item.href) {
            return true;
        }
        // Jika punya anak/cucu, cek apakah ada salah satu dari mereka yang aktif
        if (item.children && item.children.length > 0) {
            return item.children.some((child) => isModuleActive(child));
        }
        return false;
    };

    // 2. OTOMATIS BUKA DROPDOWN: Jika halaman aktif ada di dalam sub-menu modul tersebut
    useEffect(() => {
        const initialOpenStates: Record<string, boolean> = {};

        menuItems.forEach((item) => {
            if (item.children && item.children.length > 0) {
                // Cek apakah ada sub-menu yang aktif di dalam item ini
                const hasActiveChild = item.children.some((child) =>
                    isModuleActive(child),
                );
                if (hasActiveChild) {
                    initialOpenStates[item.href] = true;
                }

                // Cek juga level cucu (Level 3)
                item.children.forEach((child) => {
                    if (child.children && child.children.length > 0) {
                        const hasActiveGrandchild = child.children.some(
                            (grand) => isModuleActive(grand),
                        );
                        if (hasActiveGrandchild) {
                            initialOpenStates[child.href] = true;
                        }
                    }
                });
            }
        });

        if (Object.keys(initialOpenStates).length > 0) {
            setOpenMenus((prev) => ({ ...prev, ...initialOpenStates }));
        }
    }, [pathname, menuItems]);

    const toggleMenu = (href: string) => {
        setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
    };

    const hasSearchMatch = (item: MenuItem, query: string): boolean => {
        if (!query) return true;
        const lowerQuery = query.toLowerCase();
        const currentMatch = item.name.toLowerCase().includes(lowerQuery);
        if (currentMatch) return true;

        if (item.children && item.children.length > 0) {
            return item.children.some((child) => hasSearchMatch(child, query));
        }
        return false;
    };

    // RENDER ANAK MENU (LEVEL 2) DAN CUCU (LEVEL 3)
    // RENDER ANAK MENU (LEVEL 2) DAN CUCU (LEVEL 3)
    const renderChildMenuRow = (child: MenuItem) => {
        const isChildActive =
            pathname === `/${child.href}` || pathname === child.href;
        const isChildOrSubActive = isModuleActive(child); // Highlight jika anaknya aktif
        const hasGrandchildren = child.children && child.children.length > 0;
        const isChildOpen = !!openMenus[child.href];

        const filteredGrandchildren =
            child.children?.filter((grandchild) =>
                grandchild.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
            ) || [];

        // 1. SOLUSI SONARQUBE: Mengekstrak nested ternary menjadi conditional statement (if-else) yang bersih
        let childClassNames =
            "text-slate-500 hover:text-slate-900 hover:bg-slate-50";
        if (isChildActive) {
            childClassNames = "text-blue-600 bg-blue-50/50 font-semibold";
        } else if (isChildOrSubActive) {
            childClassNames = "text-blue-600 font-medium"; // Teks tetap biru jika cucunya sedang dibuka
        }

        return (
            <div key={child.href} className="space-y-1">
                {/* ITEM LINK CHILD (LEVEL 2) */}
                <Link
                    href={hasGrandchildren ? "#" : `/${child.href}`}
                    onClick={(e) => {
                        if (hasGrandchildren) {
                            e.preventDefault();
                            toggleMenu(child.href);
                        } else if (isMobile && setIsMobileMenuOpen) {
                            setIsMobileMenuOpen(false);
                        }
                    }}
                    className={`flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all ${childClassNames}`}
                >
                    <span className="whitespace-nowrap">{child.name}</span>

                    {hasGrandchildren && (
                        <span
                            className={`inline-block w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[3.5px] border-t-slate-400 transition-transform duration-200 ${
                                isChildOpen ? "rotate-180" : ""
                            }`}
                        />
                    )}
                </Link>

                {/* RENDER GRANDCHILDREN (LEVEL 3) */}
                {(isChildOpen || searchQuery) &&
                    filteredGrandchildren.length > 0 && (
                        <div className="pl-4 space-y-1  border-slate-200 ml-3 transition-all duration-200">
                            {filteredGrandchildren.map((grandchild) => {
                                const isGrandchildActive =
                                    pathname === `/${grandchild.href}` ||
                                    pathname === grandchild.href;

                                return (
                                    <Link
                                        key={grandchild.href}
                                        href={`/${grandchild.href}`}
                                        onClick={() => {
                                            if (
                                                isMobile &&
                                                setIsMobileMenuOpen
                                            ) {
                                                setIsMobileMenuOpen(false);
                                            }
                                        }}
                                        className={`block py-1.5 px-3 text-[11px] font-medium rounded-md transition-all ${
                                            isGrandchildActive
                                                ? "text-blue-600 bg-blue-50/40 font-semibold"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
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

    const showSidebarFeatures = isMobile || isSidebarOpen;

    return (
        <nav
            onMouseEnter={isMobile ? undefined : handleMouseEnter}
            onMouseLeave={isMobile ? undefined : handleMouseLeave}
            className={`flex-1 space-y-4 py-4 overflow-y-auto transition-all ${
                showSidebarFeatures ? "px-4" : "px-2"
            } scrollbar-thin [scrollbar-color:rgba(203,213,225,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/70`}
        >
            {/* INPUT PENCARIAN */}
            {showSidebarFeatures && (
                <div className="px-1 mb-2 animate-fade-in">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
                            <Icons name="search" size={15} />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700"
                        />
                    </div>
                </div>
            )}

            {/* DAFTAR MENU UTAMA */}
            <div className="space-y-1">
                {menuItems
                    .filter((item) => hasSearchMatch(item, searchQuery))
                    .map((item) => {
                        // 3. SEKARANG MENGGUNAKAN INDIKATOR REKURSIF
                        const isParentActive = isModuleActive(item);
                        const hasChildren =
                            item.children && item.children.length > 0;
                        const isParentOpen = !!openMenus[item.href];

                        const filteredChildren =
                            item.children?.filter((child) =>
                                hasSearchMatch(child, searchQuery),
                            ) || [];
                        return (
                            <div key={item.href} className="space-y-1">
                                {/* ITEM LINK PARENT (LEVEL 1 / MODULE UTAMA) */}
                                <Link
                                    href={hasChildren ? "#" : `/${item.href}`}
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            e.preventDefault();
                                            toggleMenu(item.href);
                                        } else if (
                                            isMobile &&
                                            setIsMobileMenuOpen
                                        ) {
                                            setIsMobileMenuOpen(false);
                                        }
                                    }}
                                    className={`flex items-center justify-between py-2.5 px-3 text-xs font-medium rounded-xl transition-all ${
                                        isParentActive
                                            ? "text-blue-600 bg-blue-50/80 font-semibold shadow-sm border border-blue-100/50"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {item.icon && (
                                            <span
                                                className={`shrink-0 transition-colors ${isParentActive ? "text-blue-600" : "text-slate-400"}`}
                                            >
                                                {item.icon}
                                            </span>
                                        )}
                                        {showSidebarFeatures && (
                                            <span className="truncate">
                                                {item.name}
                                            </span>
                                        )}
                                    </div>

                                    {hasChildren && showSidebarFeatures && (
                                        <span
                                            className={`inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-400 transition-transform duration-200 ${
                                                isParentOpen ? "rotate-180" : ""
                                            }`}
                                        />
                                    )}
                                </Link>

                                {/* RENDER CHILDREN DROP-DOWN (LEVEL 2) */}
                                {showSidebarFeatures &&
                                    (isParentOpen || searchQuery) &&
                                    filteredChildren.length > 0 && (
                                        <div className="pl-3 space-y-1 mt-0.5 transition-all duration-200">
                                            {filteredChildren.map((child) =>
                                                renderChildMenuRow(child),
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
            </div>
            <Link
                href="/master-data/parameter"
                className="flex items-center justify-between py-2.5 px-3 text-xs font-medium rounded-xl transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="truncate">Parameter</span>
                </div>
            </Link>
        </nav>
    );
}
