import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`w-full bg-slate-50/50 border rounded-lg p-2.5 text-sm text-slate-800 outline-none transition-all focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-200"
        } ${className}`}
        {...props}
      />
    );
  },
);
