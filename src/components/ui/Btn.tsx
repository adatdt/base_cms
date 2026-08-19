// src/components/Btn.tsx
import React from "react";
import ButtonSpinner, { SpinnerType } from "./ButtonSpinner";

export type ButtonVariant =
    | "success"
    | "delete"
    | "info"
    | "dark"
    | "default"
    | "success-blue"
    | "primary"
    | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    spinnerType?: SpinnerType;
    children: React.ReactNode;
    asDiv?: boolean; // 🌟 Properti pembantu khusus untuk DropdownBtn
}

export const variantStyles: Record<ButtonVariant, string> = {
    success:
        "bg-emerald-600 hover:bg-emerald-700 text-slate-100 focus:ring-emerald-500",
    delete: "bg-red-600 hover:bg-red-700 text-slate-100 focus:ring-red-500",
    info: "bg-amber-600 hover:bg-amber-700 text-slate-100 focus:ring-amber-500",
    dark: "bg-slate-200 hover:bg-slate-300 text-slate-900 focus:ring-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100",

    // 👑 SEKARANG: Gunakan CSS Variable agar warnanya bisa disusupi dari luar
    default:
        "bg-white hover:bg-slate-50 text-[var(--btn-text,theme(colors.slate.800))] border border-slate-200 shadow-xs focus:ring-slate-300",
    "success-blue":
        "bg-gradient-to-r from-[#2a68d0] to-[#5190f3] text-[var(--btn-text,theme(colors.white))] hover:from-[#2154ab] hover:to-[#3e7fe0] active:from-[#1b4691] active:to-[#326cc4] focus:ring-blue-400/20",

    primary: "bg-blue-600 hover:bg-blue-700 text-slate-100 focus:ring-blue-500",
    ghost: "bg-white hover:bg-slate-50 text-[var(--btn-text,theme(colors.slate.800))] focus:ring-slate-300",
};

export const colorStyles = {
    success: {
        background: "bg-emerald-600",
        hover: "hover:bg-emerald-700",
        ring: "focus:ring-emerald-500",
    },

    "success-blue": {
        background:
            "bg-gradient-to-r from-[#2a68d0] to-[#5190f3]",
        hover:
            "hover:from-[#2154ab] hover:to-[#3e7fe0]",
        active:
            "active:from-[#1b4691] active:to-[#326cc4]",
        ring:
            "focus:ring-blue-400/20",
    },
};

export const sizeStyles: Record<ButtonSize, string> = {
    xs: "px-2 py-1 text-[10px] rounded-sm gap-1 h-[26px]",
    sm: "px-3 py-1.5 text-xs rounded-md gap-1.5 h-[32px]",
    md: "px-4 py-2 text-sm rounded-lg gap-2 h-[38px]",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5 h-[46px]",
};

export const baseStyle =
    "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer select-none";

export default function Btn({
    variant = "default",
    size = "md",
    fullWidth = false,
    isLoading = false,
    spinnerType = "spin",
    children,
    className = "",
    disabled,
    type = "button",
    asDiv = false, // 🌟 Default false agar tombol biasa di tempat lain tidak terpengaruh
    ...props
}: Readonly<ButtonProps>) {
    const isDisabled = Boolean(disabled || isLoading);
    const widthStyle = fullWidth ? "w-full" : "w-auto";
    const combinedClasses = `${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

    // 🌟 PERBAIKAN: Masukkan komponen ButtonSpinner ke dalam render elemen DIV
    if (asDiv) {
        return (
            <div
                className={`${combinedClasses} ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
            >
                {/* 🌟 Spinner sekarang merender dengan benar di dalam pembungkus div dropdown */}
                {isLoading && <ButtonSpinner type={spinnerType} />}

                <div className="flex flex-row items-center justify-center gap-1.5 pointer-events-none w-full h-full">
                    {children}
                </div>
            </div>
        );
    }

    // 🌟 Tombol asli bawaan Anda tetap aman dan berjalan seperti biasa di bawah sini
    return (
        <button
            type={type}
            disabled={isDisabled}
            className={combinedClasses}
            aria-live="polite"
            aria-busy={isLoading}
            {...props}
        >
            {isLoading && <ButtonSpinner type={spinnerType} />}

            <div className="flex flex-row items-center justify-center gap-1.5 pointer-events-none w-full h-full">
                {children}
            </div>
        </button>
    );
}
