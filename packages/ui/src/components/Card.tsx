import React from "react";
import { cn } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "cyan" | "purple" | "none";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glowColor = "none",
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300 p-6",
        // Base glass styles
        "bg-[#111827]/70 backdrop-blur-md border-border",
        // Glow options
        {
          "border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.03)]": glowColor === "cyan",
          "border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.03)]": glowColor === "purple",
        },
        // Hover effects
        hoverEffect && "hover:border-[#ffffff]/15 hover:bg-[#111827]/80",
        hoverEffect && glowColor === "cyan" && "hover:border-[#00E5FF]/50 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]",
        hoverEffect && glowColor === "purple" && "hover:border-[#8B5CF6]/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
