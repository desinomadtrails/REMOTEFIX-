import React from "react";
import { cn } from "../utils.js";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "cyber";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, glow, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-display font-medium rounded-lg transition-all duration-300 active:scale-97 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] focus:ring-primary",
          // Sizes
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-8 py-3.5 text-lg": size === "lg",
          },
          // Variants
          {
            "bg-primary text-[#030712] hover:bg-[#00E5FF]/90 font-semibold shadow-[0_0_15px_rgba(0,229,255,0.2)]":
              variant === "primary",
            "bg-[#111827] text-text border border-border hover:bg-surface-hover hover:border-[#8B5CF6]/40":
              variant === "secondary",
            "bg-transparent border border-border text-text hover:bg-surface-hover hover:text-white":
              variant === "outline",
            "bg-danger text-white hover:bg-danger/90 shadow-[0_0_15px_rgba(239,68,68,0.2)]":
              variant === "danger",
            "bg-transparent hover:bg-surface text-muted hover:text-text": variant === "ghost",
            "bg-transparent text-primary border border-primary/50 hover:bg-primary/10 hover:border-primary shadow-[0_0_10px_rgba(0,229,255,0.1)]":
              variant === "cyber",
          },
          // Glow modifier
          glow && variant === "primary" && "shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.65)]",
          glow && variant === "cyber" && "shadow-[0_0_20px_rgba(0,229,255,0.25)]",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
