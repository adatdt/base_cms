import React from 'react';
import ButtonSpinner, { SpinnerType } from './ButtonSpinner';

type ButtonVariant = 'success' | 'delete' | 'info' | 'default' | 'primary';
// Menambahkan tipe ukuran (size) baru
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;          // Tambahan prop untuk ukuran
  fullWidth?: boolean;        // Tambahan prop untuk lebar penuh (w-full)
  isLoading?: boolean;
  spinnerType?: SpinnerType;
  children: React.ReactNode;
}

// SonarQube Best Practice: Deklarasikan objek statis di luar komponen utama
const variantStyles: Record<ButtonVariant, string> = {
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  delete: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  info: 'bg-amber-500 hover:bg-amber-600 text-black focus:ring-amber-400',
  default: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
};

// Objek statis baru untuk memetakan ukuran padding dan teks tombol
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5 h-[32px]',
  md: 'px-4 py-2 text-sm rounded-lg gap-2 h-[38px]',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5 h-[46px]',
};

const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';

export default function Button({
  variant = 'default',
  size = 'md',               // Default ukuran adalah medium
  fullWidth = false,         // Default lebar mengikuti konten di dalamnya
  isLoading = false,
  spinnerType = 'spin',
  children,
  className = '',
  disabled,
  ...props
}: Readonly<ButtonProps>) {
  
  const isDisabled = disabled || isLoading;
  
  // Menggabungkan class dinamis untuk lebar (width)
  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
  <button
    className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
    disabled={isDisabled}
    aria-busy={isLoading}
    {...props}
  >
    {isLoading && <ButtonSpinner type={spinnerType} />}
    
    {/* Menggunakan container flex horizontal internal agar icon dan teks PASTI sejajar ke samping */}
    <div className="flex flex-row items-center justify-center gap-1.5 pointer-events-none w-full h-full">
      {children}
    </div>
  </button>
);
}
