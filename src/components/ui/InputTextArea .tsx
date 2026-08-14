import React from "react";

export type InputSize = "sm" | "md" | "lg";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
    inputSize?: InputSize;
    width?: number | string;
    height?: number | string;
    // Tambahkan type di sini agar TypeScript tahu kita akan mengekstraknya keluar
    type?: string;
}

const sizeClasses: Record<InputSize, string> = {
    sm: "p-2 text-xs rounded-md",
    md: "p-2.5 text-sm rounded-lg",
    lg: "p-3.5 text-base rounded-xl",
};

export const InputTextArea = React.forwardRef<
    HTMLTextAreaElement,
    TextAreaProps
>(
    (
        {
            className = "",
            hasError,
            inputSize = "md",
            rows = 4,
            width,
            height,
            style,
            type, // 1. Ekstrak 'type' di sini agar dipisahkan dari objek ...props
            ...props
        },
        ref,
    ) => {
        const customStyle: React.CSSProperties = {
            ...style,
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
        };

        return (
            <textarea
                ref={ref}
                rows={rows}
                style={customStyle}
                // 2. Karena 'type' sudah diekstrak di atas, objek ...props di bawah ini
                //    tidak akan lagi mengandung atribut 'type' secara tidak sengaja.
                className={`bg-slate-50/50 border text-slate-800 outline-none transition-all resize-y focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
                    width ? "" : "w-full"
                } ${sizeClasses[inputSize]} ${
                    hasError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200"
                } ${className}`}
                {...props}
            />
        );
    },
);

InputTextArea.displayName = "InputTextArea";
