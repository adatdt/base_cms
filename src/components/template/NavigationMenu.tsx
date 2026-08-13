"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const normalizePath = (href: string): string =>
    href.startsWith("/") ? href : `/${href}`;

const hasChildren = (item: MenuItem): boolean =>
    Array.isArray(item.children) && item.children.length > 0;

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

    const query = searchQuery.trim().toLowerCase();
    const showSidebarFeatures = isMobile || isSidebarOpen;

    const isItemActive = useCallback(
        (item: MenuItem): boolean => {
            const currentPath = normalizePath(item.href);

            if (pathname === currentPath) {
                return true;
            }

            const children = item.children;

            if (!children) {
                return false;
            }

            return children.some((child) => isItemActive(child));
        },
        [pathname],
    );

    const matchesSearch = useCallback(
        (item: MenuItem): boolean => {
            if (!query) {
                return true;
            }

            if (item.name.toLowerCase().includes(query)) {
                return true;
            }

            const children = item.children;

            if (!children) {
                return false;
            }

            return children.some((child) => matchesSearch(child));
        },
        [query],
    );

    const getActiveMenuKeys = useCallback(
        (items: MenuItem[]): string[] => {
            const keys: string[] = [];

            const collectKeys = (item: MenuItem): void => {
                if (item.children) {
                    item.children.forEach(collectKeys);
                }

                if (isItemActive(item)) {
                    keys.push(item.href);
                }
            };

            items.forEach(collectKeys);

            return keys;
        },
        [isItemActive],
    );

    useEffect(() => {
        const activeKeys = getActiveMenuKeys(menuItems);

        if (activeKeys.length === 0) {
            return;
        }

        setOpenMenus((current) => {
            const next = { ...current };

            activeKeys.forEach((key) => {
                next[key] = true;
            });

            return next;
        });
    }, [getActiveMenuKeys, menuItems]);

    const toggleMenu = useCallback((href: string): void => {
        setOpenMenus((current) => ({
            ...current,
            [href]: !current[href],
        }));
    }, []);

    const closeMobileMenu = useCallback((): void => {
        if (isMobile && setIsMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [isMobile, setIsMobileMenuOpen]);

    const getChildren = useCallback(
        (item: MenuItem): MenuItem[] => {
            if (!item.children) {
                return [];
            }

            return item.children.filter(matchesSearch);
        },
        [matchesSearch],
    );

    const filteredMenuItems = useMemo(
        () => menuItems.filter(matchesSearch),
        [matchesSearch, menuItems],
    );

    const renderMenuItems = useCallback(
        (items: MenuItem[], level: number): React.ReactNode => {
            return items.map((item) => {
                const itemHasChildren = hasChildren(item);
                const itemIsOpen = Boolean(openMenus[item.href]);
                const itemIsActive = isItemActive(item);
                const itemIsCurrent = pathname === normalizePath(item.href);
                const children = getChildren(item);
                const isRootLevel = level === 1;

                let itemClassName =
                    "flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all";

                if (isRootLevel) {
                    itemClassName =
                        "flex items-center justify-between py-2.5 px-3 text-xs font-medium rounded-xl transition-all";
                }

                if (itemIsCurrent) {
                    if (isRootLevel) {
                        itemClassName +=
                            " text-blue-600 bg-blue-50 font-semibold shadow-sm border border-blue-100/50";
                    } else {
                        itemClassName +=
                            " text-blue-600 bg-blue-50 font-semibold";
                    }
                } else if (itemIsActive) {
                    itemClassName += " text-blue-600 bg-blue-50 font-medium";
                } else if (isRootLevel) {
                    itemClassName +=
                        " text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent";
                } else {
                    itemClassName +=
                        " text-slate-500 hover:text-slate-900 hover:bg-slate-50";
                }

                return (
                    <div key={item.id ?? item.href} className="space-y-1">
                        <Link
                            href={
                                itemHasChildren ? "#" : normalizePath(item.href)
                            }
                            onClick={(event) => {
                                if (itemHasChildren) {
                                    event.preventDefault();
                                    toggleMenu(item.href);
                                    return;
                                }

                                closeMobileMenu();
                            }}
                            className={itemClassName}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                {isRootLevel && item.icon && (
                                    <span
                                        className={
                                            itemIsActive
                                                ? "shrink-0 text-blue-600"
                                                : "shrink-0 text-slate-400"
                                        }
                                    >
                                        {item.icon}
                                    </span>
                                )}

                                {showSidebarFeatures && (
                                    <span
                                        className={
                                            isRootLevel
                                                ? "truncate"
                                                : "whitespace-nowrap"
                                        }
                                    >
                                        {item.name}
                                    </span>
                                )}
                            </div>

                            {itemHasChildren && showSidebarFeatures && (
                                <span
                                    aria-hidden="true"
                                    className={`inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-400 transition-transform duration-200 ${
                                        itemIsOpen ? "rotate-180" : ""
                                    }`}
                                />
                            )}
                        </Link>

                        {itemHasChildren &&
                            showSidebarFeatures &&
                            (itemIsOpen || Boolean(query)) &&
                            children.length > 0 && (
                                <div
                                    className={
                                        isRootLevel
                                            ? "pl-3 space-y-1 mt-0.5"
                                            : "pl-4 space-y-1 border-slate-200 ml-3"
                                    }
                                >
                                    {renderMenuItems(children, level + 1)}
                                </div>
                            )}
                    </div>
                );
            });
        },
        [
            closeMobileMenu,
            getChildren,
            isItemActive,
            openMenus,
            pathname,
            query,
            showSidebarFeatures,
            toggleMenu,
        ],
    );

    return (
        <nav
            onMouseEnter={isMobile ? undefined : handleMouseEnter}
            onMouseLeave={isMobile ? undefined : handleMouseLeave}
            className={`flex-1 space-y-4 py-4 overflow-y-auto ${
                showSidebarFeatures ? "px-4" : "px-2"
            } scrollbar-thin [scrollbar-color:rgba(203,213,225,0.4)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300/70`}
        >
            {showSidebarFeatures && (
                <div className="px-1 mb-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
                            <Icons name="search" size={15} />
                        </span>

                        <input
                            type="text"
                            placeholder="Cari menu..."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            aria-label="Cari menu"
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                {renderMenuItems(filteredMenuItems, 1)}
            </div>
            <a
                className="flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                href="/master-data/parameter"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="whitespace-nowrap">Parameter</span>
                </div>
            </a>
        </nav>
    );
}
