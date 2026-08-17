import React from "react";

// 1. Definisikan tipe ukuran yang tersedia
export type InputSize = "sm" | "md" | "lg";

// 2. Buat tipe kustom terpisah untuk menghindari tabrakan properti kustom 'size' dengan HTML
type CustomInputProps = {
    hasError?: boolean;
    inputSize?: InputSize;
    size?: InputSize;      // Toleransi jika tidak sengaja memanggil prop 'size' berupa string
    addOnLeft?: string;    // Teks add-on sebelah kiri (opsional)
    addOnRight?: string;   // Teks add-on sebelah kanan (opsional)
};

// 3. Gabungkan tipe data menggunakan Intersection (&) dan buang 'size' bawaan HTML input yang bertipe number
export type InputProps = CustomInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

// 4. Objek pemetaan kelas Tailwind untuk INPUT BIASA (Tanpa Add-on)
const standaloneSizeClasses: Record<InputSize, string> = {
    sm: "p-2 text-xs rounded-md",
    md: "p-2.5 text-sm rounded-lg",
    lg: "p-3.5 text-base rounded-xl",
};

// 5. Objek pemetaan tinggi & radius border untuk WRAPPER (Ketika pakai Add-on)
const wrapperSizeClasses: Record<InputSize, string> = {
    sm: "h-8 text-xs rounded-md",
    md: "h-10 text-sm rounded-lg", 
    lg: "h-12 text-base rounded-xl",
};

// 6. Objek pemetaan padding horizontal untuk INPUT & ADD-ON (Ketika pakai Add-on)
const paddingSizeClasses: Record<InputSize, string> = {
    sm: "px-2.5",
    md: "px-3.5",
    lg: "px-4.5",
};

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { 
            className = "", 
            hasError, 
            inputSize = "md", 
            size, 
            type = "text", 
            addOnLeft = "", 
            addOnRight = "", 
            ...props 
        },
        ref,
    ) => {
        // Gabungkan fallback jika menggunakan prop size atau inputSize
        const finalSize = size || inputSize;
        
        // Kondisi penentu apakah komponen menggunakan fitur add-on atau tidak
        const hasAddOn = !!addOnLeft || !!addOnRight;

        // JIKA MENGGUNAKAN ADD-ON
        if (hasAddOn) {
            return (
                <div
                    className={`flex items-stretch bg-slate-50/50 border text-slate-800 overflow-hidden transition-all focus-within:bg-white focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-500/10 ${
                        wrapperSizeClasses[finalSize]
                    } ${
                        hasError
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
                            : "border-slate-200"
                    } ${className}`}
                >
                    {/* Kotak Add-on Kiri */}
                    {addOnLeft && (
                        <span className={`flex items-center justify-center bg-slate-100 text-slate-500 border-r border-inherit font-normal select-none ${paddingSizeClasses[finalSize]}`}>
                            {addOnLeft}
                        </span>
                    )}

                    {/* Field Input Utama (Tinggi full mengikuti wrapper) */}
                    <input
                        type={type}
                        ref={ref}
                        className={`w-full h-full bg-transparent font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 ${paddingSizeClasses[finalSize]}`}
                        {...props}
                    />

                    {/* Kotak Add-on Kanan */}
                    {addOnRight && (
                        <span className={`flex items-center justify-center bg-slate-100 text-slate-500 border-l border-inherit font-normal select-none ${paddingSizeClasses[finalSize]}`}>
                            {addOnRight}
                        </span>
                    )}
                </div>
            );
        }

        // JIKA INPUT BIASA (Tanpa Add-on - Menjaga gaya asli 100% seperti kode lama Anda)
        return (
            <input
                type={type}
                ref={ref}
                className={`w-full bg-slate-50/50 border text-slate-800 outline-none transition-all focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
                    standaloneSizeClasses[finalSize]
                } ${
                    hasError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200"
                } ${className}`}
                {...props}
            />
        );
    },
);

InputText.displayName = "InputText";
