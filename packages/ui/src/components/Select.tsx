import React from "react";
import { cn } from "../utils.js";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label className="text-sm font-medium font-display text-muted select-none">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-3 bg-[#111827]/60 border rounded-lg text-text font-body transition-all duration-200 outline-none appearance-none cursor-pointer",
              "border-border focus:border-primary focus:ring-1 focus:ring-primary/30",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-text">
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom Arrow Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-xs text-danger font-medium font-body mt-0.5">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
