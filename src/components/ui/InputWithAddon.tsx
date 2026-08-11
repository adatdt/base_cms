import React from "react";
import { InputText, InputProps, InputSize } from "./InputText";

export interface InputWithAddonProps extends Omit<InputProps, "onChange"> {
    /** Nilai teks di dalam kotak input (Controlled Component) */
    value: string;
    /** Fungsi callback ketika isi ketikan di dalam input berubah */
    onChange: (value: string) => void;
    /** Teks label penanda yang menempel di sisi kiri kotak input (Bisa berupa Teks atau Ikon) */
    addonLabel: React.ReactNode;
}

// 1. Pemetaan tinggi dan gaya khusus untuk SISI ADDON (Kiri) agar simetris dengan InputText Anda
const addonSizeClasses: Record<InputSize, string> = {
    sm: "h-[34px] px-3 text-xs rounded-l-md", // Sinkron dengan padding p-2 milik InputText sm
    md: "h-[38px] px-3.5 text-sm rounded-l-lg", // Sinkron dengan padding p-2.5 milik InputText md
    lg: "h-[46px] px-4 text-base rounded-l-xl", // Sinkron dengan padding p-3.5 milik InputText lg
};

// 2. Kelas penimpa radius sudut kanan agar InputText bermutasi menjadi kotak lurus di sisi kirinya
const inputRadiusOverride: Record<InputSize, string> = {
    sm: "!rounded-r-md !rounded-l-none",
    md: "!rounded-r-lg !rounded-l-none",
    lg: "!rounded-r-xl !rounded-l-none",
};

export const InputWithAddon = React.forwardRef<
    HTMLInputElement,
    InputWithAddonProps
>(
    (
        {
            value,
            onChange,
            addonLabel,
            hasError = false,
            inputSize = "md", // State ini memegang kontrol utama ukuran global komponen
            className = "",
            ...props
        },
        ref,
    ) => {
        return (
            <div
                className={`flex flex-1 items-center w-full space-x-0 isolate ${className}`}
            >
                {/* SISI KIRI: Addon Label Tempel (Statis) */}
                <span
                    className={`flex items-center justify-center bg-slate-100 border border-r-0 text-slate-500 select-none whitespace-nowrap z-10 transition-all ${
                        addonSizeClasses[inputSize]
                    } ${
                        hasError
                            ? "border-red-400 text-red-500 bg-red-50/30"
                            : "border-slate-200"
                    }`}
                >
                    {addonLabel}
                </span>

                {/* SISI KANAN: Menggunakan kembali komponen InputText Anda secara murni */}
                <InputText
                    ref={ref}
                    value={value}
                    hasError={hasError}
                    inputSize={inputSize} // 👑 KUNCI UTAMA: Wajib ditembak manual di sini agar nilainya tidak tenggelam di dalam ...props
                    onChange={(e) => onChange(e.target.value)}
                    // 👑 PERBAIKAN SINTAKS: Memperbaiki letak tanda seru (!) Tailwind di posisi depan kelas
                    className={`-ml-px z-0! focus:z-20! shadow-sm ${inputRadiusOverride[inputSize]}`}
                    {...props}
                />
            </div>
        );
    },
);

InputWithAddon.displayName = "InputWithAddon";
export default InputWithAddon;
