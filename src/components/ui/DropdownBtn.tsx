"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import Btn, { ButtonVariant, ButtonSize } from "./Btn";
import { SpinnerType } from "./ButtonSpinner";
import Icons from "@/components/ui/Icons";

export interface DropdownItem {
    /** Mengambil teks string atau struktur elemen JSX kustom */
    label: React.ReactNode;
    /** Fungsi aksi ketika item menu diklik */
    onClick?: () => void;
    fontWeight?: "normal" | "medium" | "bold";
    fontSize?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Memungkinkan Anda mengatur kelas lebar per item dari depan (misal: "w-56") */
    widthClass?: string;
    className?: string;
    /** Jika false, mengklik baris ini tidak akan otomatis menutup menu dropdown */
    closeOnItemClick?: boolean;
}

interface DropdownBtnProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    widthClass?: string;
    alignClass?: string;
    size?: ButtonSize;
    variant?: ButtonVariant;
    className?: string;
    isLoading?: boolean;
    spinnerType?: SpinnerType;
    isCircle?: boolean;
    // 🌟 PROP BARU OPSIONAL: Judul Header atau Konten JSX Custom untuk Header
    header?: React.ReactNode;
    // 🌟 PROP BARU OPSIONAL: Konten JSX Custom untuk Bagian Bawah Menu (Footer)
    footer?: React.ReactNode;
    zIndexClass?: string;
}

const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    bold: "font-bold",
};

const sizeClasses = {
    xs: "text-[10px]", // Disamakan dengan text-[10px] pada sizeStyles.xs
    sm: "text-xs", // Disamakan dengan text-xs pada sizeStyles.sm
    md: "text-sm", // Disamakan dengan text-sm pada sizeStyles.md
    lg: "text-base", // Disamakan dengan text-base pada sizeStyles.lg
    xl: "text-lg", // Tetap sebagai nilai cadangan jika dibutuhkan ukuran ekstra
};

const circleSizeClasses: Record<ButtonSize, string> = {
    xs: "!p-0 w-[26px] h-[26px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center text-[10px]",
    sm: "!p-0 w-[32px] h-[32px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center text-xs",
    md: "!p-0 w-[38px] h-[38px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center text-sm",
    lg: "!p-0 w-[46px] h-[46px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center text-base",
};

export const DropdownBtn: React.FC<DropdownBtnProps> = ({
    trigger,
    items,
    widthClass = "w-64",
    alignClass = "right-0",
    size = "md",
    variant = "default",
    className = "",
    isLoading = false,
    spinnerType = "spin",
    isCircle = false,
    header,
    footer,
    zIndexClass = "z-50",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const baseId = useId();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((prev) => !prev);
        }
    };

    const isDisabled = Boolean(isLoading);
    const shapeClass = isCircle ? circleSizeClasses[size] : "";

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            {/* Tombol Utama (Pemicu/Trigger Dropdown) */}
            <button
                type="button"
                disabled={isDisabled}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-busy={isLoading}
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={handleKeyDown}
                className="focus:outline-none disabled:pointer-events-none"
            >
                <Btn
                    variant={variant}
                    size={size}
                    asDiv={true}
                    isLoading={isLoading}
                    spinnerType={spinnerType}
                    className={`${shapeClass} ${className}`}
                >
                    {trigger}
                </Btn>
            </button>

            {/* Panel Daftar Menu Dropdown */}
            {/* Panel Daftar Menu Dropdown */}
            {isOpen && (
                <div
                    // 👑 PERBAIKAN: Menghapus max-w-xs agar w-56, w-64, atau w-72 bisa melebar penuh tanpa mentok batas maksimal
                    className={`absolute ${alignClass} ${zIndexClass} mt-1 ${widthClass} max-w-sm sm:max-w-md md:max-w-lg bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden origin-top-right flex flex-col`}
                >
                    {/* RENDER HEADER OPSIONAL */}
                    {header && (
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/40 shrink-0">
                            <div className="text-xs font-semibold text-slate-700 truncate pr-2">
                                {header}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer focus:outline-none flex items-center justify-center w-6 h-6 shrink-0"
                                aria-label="Close menu"
                            >
                                <Icons name="close" size={15} />
                            </button>
                        </div>
                    )}

                    {/* AREA BODY / CONTENT LIST */}
                    <div className="p-1.5 space-y-0.5 overflow-y-auto max-h-[60vh]">
                        {items.map((item, index) => {
                            const shouldClose = item.closeOnItemClick !== false;
                            const isStringLabel =
                                typeof item.label === "string";

                            const handleAction = (
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                if (isStringLabel) {
                                    if (shouldClose) setIsOpen(false);
                                    if (item.onClick) item.onClick();
                                } else if (!shouldClose) {
                                    e.stopPropagation();
                                }
                            };

                            const paddingClass = isStringLabel
                                ? "py-2.5"
                                : "py-2";
                            const fontWeightClass = isStringLabel
                                ? weightClasses[item.fontWeight || "medium"]
                                : "";
                            const contentSlug = isStringLabel
                                ? (item.label as string)
                                      .replace(/\s+/g, "-")
                                      .toLowerCase()
                                : "custom-node";
                            const itemKey = `${baseId}-${contentSlug}-${index}`;

                            // 👑 PERBAIKAN: Gunakan properti item.widthClass jika diisi, jika kosong WAJIB fallback ke "w-full" (Bukan hardcode w-64)
                            const itemWidthStyle = item.widthClass || "w-full";

                            return (
                                <button
                                    key={itemKey}
                                    type="button"
                                    onClick={handleAction}
                                    className={`${itemWidthStyle} text-left px-4 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors block border-none bg-transparent cursor-pointer ${paddingClass} ${fontWeightClass} ${
                                        sizeClasses[item.fontSize || "sm"]
                                    } ${item.className || ""}`}
                                >
                                    {/* 👑 PERBAIKAN: Hapus kelas 'truncate' jika item tersebut berupa JSX kustom (seperti input pencarian) agar inputnya bisa melebar penuh */}
                                    <span
                                        className={`block ${isStringLabel ? "truncate" : ""}`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* RENDER FOOTER OPSIONAL */}
                    {footer && (
                        <div className=" py-2.5 border-t border-slate-50 text-[11px] text-slate-400 shrink-0">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
