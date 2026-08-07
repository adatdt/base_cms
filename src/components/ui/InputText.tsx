import React from "react";

// 1. Definisikan tipe ukuran yang tersedia
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
    inputSize?: InputSize; // 2. Tambahkan properti inputSize opsional
}

// 3. Buat objek pemetaan untuk kelas Tailwind berdasarkan ukuran
const sizeClasses: Record<InputSize, string> = {
    sm: "p-2 text-xs rounded-md",
    md: "p-2.5 text-sm rounded-lg", // Ini adalah ukuran bawaan Anda sebelumnya
    lg: "p-3.5 text-base rounded-xl",
};

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { className = "", hasError, inputSize = "md", type = "text", ...props },
        ref,
    ) => {
        return (
            <input
                type={type}
                ref={ref}
                // 4. Masukkan sizeClasses[inputSize] ke dalam className
                className={`w-full bg-slate-50/50 border text-slate-800 outline-none transition-all focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
                    sizeClasses[inputSize]
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
