import React from "react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

export const CheckboxData = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const fallbackId = id || props.name;

    return (
      <label
        htmlFor={fallbackId}
        className={`flex items-center gap-3 cursor-pointer group text-slate-700 select-none ${className}`}
      >
        <input
          type="checkbox"
          ref={ref}
          id={fallbackId}
          className="w-5 h-5 rounded border-slate-300 text-slate-700 focus:ring-slate-500/40 focus:ring-offset-0 transition-colors cursor-pointer"
          {...props}
        />
        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
          {label}
        </span>
      </label>
    );
  },
);
