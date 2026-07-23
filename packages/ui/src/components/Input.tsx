import React from "react";
import { cn } from "../utils.js";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label className="text-sm font-medium font-display text-muted select-none">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full px-4 py-3 bg-[#111827]/60 border rounded-lg text-text font-body transition-all duration-200 outline-none",
              "border-border focus:border-primary focus:ring-1 focus:ring-primary/30",
              error && "border-danger focus:border-danger focus:ring-danger/20",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-danger font-medium font-body mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted font-body mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
