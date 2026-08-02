import React from "react";

interface RadioOption {
  value: string | number;
  label: string;
}

export interface RadioGroupProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  options: RadioOption[];
}

export const RadioData = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className = "", options = [], name, ...props }, ref) => {
    return (
      <div className={`flex flex-wrap gap-4 ${className}`}>
        {options.map((option) => {
          const uniqueId = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={uniqueId}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <input
                type="radio"
                ref={ref}
                name={name}
                id={uniqueId}
                value={option.value}
                className="w-5 h-5 border-slate-300 text-slate-700 focus:ring-slate-500/40 focus:ring-offset-0 transition-colors cursor-pointer"
                {...props}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    );
  },
);
