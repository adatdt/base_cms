import React from "react";
import ButtonSpinner, { SpinnerType } from "./ButtonSpinner";

type ButtonVariant = "success" | "delete" | "info" | "default" | "primary";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  spinnerType?: SpinnerType;
  children: React.ReactNode;
}

// PERBAIKAN: Mengganti 'text-white' dengan 'text-slate-100' untuk warna putih lembut
const variantStyles: Record<ButtonVariant, string> = {
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-slate-100 focus:ring-emerald-500",
  delete: "bg-red-600 hover:bg-red-700 text-slate-100 focus:ring-red-500",
  info: "bg-amber-600 hover:bg-amber-700 text-slate-100 focus:ring-amber-500", // Menggunakan bg-amber-600 agar teks putih lembut tetap terbaca jelas
  default:
    "bg-slate-200 hover:bg-slate-300 text-slate-900 focus:ring-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100",
  primary: "bg-blue-600 hover:bg-blue-700 text-slate-100 focus:ring-blue-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-[10px] rounded-sm gap-1 h-[26px]",
  sm: "px-3 py-1.5 text-xs rounded-md gap-1.5 h-[32px]",
  md: "px-4 py-2 text-sm rounded-lg gap-2 h-[38px]",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2.5 h-[46px]",
};

const baseStyle =
  "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:pointer-events-none";

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
  ...props
}: Readonly<ButtonProps>) {
  const isDisabled = Boolean(disabled || isLoading);
  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
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
