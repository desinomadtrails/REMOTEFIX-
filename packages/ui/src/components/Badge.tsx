import React from "react";
import { cn } from "../utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "muted";
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "muted",
  glow = false,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide uppercase transition-all duration-300",
        {
          "bg-[#00E5FF]/10 text-primary border border-primary/30": variant === "primary",
          "bg-[#8B5CF6]/10 text-secondary border border-[#8B5CF6]/30": variant === "secondary",
          "bg-[#10B981]/10 text-success border border-success/30": variant === "success",
          "bg-[#F59E0B]/10 text-warning border border-warning/30": variant === "warning",
          "bg-[#EF4444]/10 text-danger border border-danger/30": variant === "danger",
          "bg-[#22D3EE]/10 text-accent border border-accent/30": variant === "info",
          "bg-[#374151]/40 text-muted border border-border": variant === "muted",
        },
        // Glow styling
        glow && {
          "shadow-[0_0_8px_rgba(0,229,255,0.25)]": variant === "primary",
          "shadow-[0_0_8px_rgba(139,92,246,0.25)]": variant === "secondary",
          "shadow-[0_0_8px_rgba(16,185,129,0.25)]": variant === "success",
          "shadow-[0_0_8px_rgba(245,158,11,0.25)]": variant === "warning",
          "shadow-[0_0_8px_rgba(239,68,68,0.25)]": variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
