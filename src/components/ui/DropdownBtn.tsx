// src/components/DropdownBtn.tsx
import React, { useState, useRef, useEffect, useId } from "react";
import Btn, { ButtonVariant, ButtonSize } from "./Btn";
import { SpinnerType } from "./ButtonSpinner";

export interface DropdownItem {
    /** Mengambil teks string atau struktur elemen JSX kustom */
    label: React.ReactNode;
    /** Fungsi aksi ketika item menu diklik */
    onClick?: () => void;
    fontWeight?: "normal" | "medium" | "bold";
    fontSize?: "xs" | "sm" | "md" | "lg" | "xl";
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
    isCircle?: boolean; // 🌟 Prop baru untuk membuat tombol pemicu menjadi bulat sempurna
}

const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    bold: "font-bold",
};

const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
};

const circleSizeClasses: Record<ButtonSize, string> = {
    xs: "!p-0 w-[26px] h-[26px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center",
    sm: "!p-0 w-[32px] h-[32px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center",
    md: "!p-0 w-[38px] h-[38px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center",
    lg: "!p-0 w-[46px] h-[46px] !rounded-full aspect-square !flex-shrink-0 flex items-center justify-center",
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
    isCircle = false, // 🌟 Default bernilai false agar tidak merubah tombol bawaan
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

    // 🌟 Menggabungkan class bentuk lingkaran jika parameter isCircle bernilai true
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
                    className={`${shapeClass} ${className}`} // 🌟 Menyisipkan penentu bentuk lingkaran
                >
                    {trigger}
                </Btn>
            </button>

            {/* Panel Daftar Menu Dropdown */}
            {isOpen && (
                <div
                    // 👑 PERBAIKAN: Mengganti ${widthClass} dengan min-w-max / min-w-[120px] dan w-max dinamis
                    className={`absolute ${alignClass} z-50 mt-1 min-w-35 w-max max-w-xs sm:max-w-sm md:max-w-md bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden origin-top-right p-1.5`}
                >
                    {items.map((item, index) => {
                        const shouldClose = item.closeOnItemClick !== false;
                        const isStringLabel = typeof item.label === "string";

                        const handleAction = (
                            e: React.MouseEvent<HTMLButtonElement>,
                        ) => {
                            if (isStringLabel) {
                                if (shouldClose) setIsOpen(false);
                                if (item.onClick) item.onClick();
                            } else if (!shouldClose) e.stopPropagation();
                        };

                        const paddingClass = isStringLabel ? "py-2.5" : "py-2";
                        const fontWeightClass = isStringLabel
                            ? weightClasses[item.fontWeight || "medium"]
                            : "";

                        const contentSlug = isStringLabel
                            ? (item.label as string)
                                  .replace(/\s+/g, "-")
                                  .toLowerCase()
                            : "custom-node";

                        const itemKey = `${baseId}-${contentSlug}-${index}`;

                        return (
                            <button
                                key={itemKey}
                                type="button"
                                onClick={handleAction}
                                className={`w-full text-left px-4 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors block border-none bg-transparent cursor-pointer ${paddingClass} ${fontWeightClass} ${
                                    sizeClasses[item.fontSize || "sm"]
                                } ${item.className || ""}`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
