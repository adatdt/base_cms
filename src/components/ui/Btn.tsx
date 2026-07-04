import React from 'react';
import ButtonSpinner, { SpinnerType } from './ButtonSpinner';

type ButtonVariant = 'success' | 'delete' | 'info' | 'default' | 'primary';
// 1. Menambahkan tipe ukuran 'xs' baru
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  spinnerType?: SpinnerType;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  delete: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  info: 'bg-amber-500 hover:bg-amber-600 text-black focus:ring-amber-400',
  default: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400',
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
};

// 2. Menambahkan objek statis baru untuk ukuran 'xs'
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[10px] rounded-sm gap-1 h-[26px]', // Ukuran ekstra kecil yang proporsional
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5 h-[32px]',
  md: 'px-4 py-2 text-sm rounded-lg gap-2 h-[38px]',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5 h-[46px]',
};

const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';

export default function Btn({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  spinnerType = 'spin',
  children,
  className = '',
  disabled,
  ...props
}: Readonly<ButtonProps>) {
  
  const isDisabled = disabled || isLoading;
  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={isDisabled}
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
