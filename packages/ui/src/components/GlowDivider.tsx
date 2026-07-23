import React from "react";
import { cn } from "../utils.js";

export interface GlowDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "cyan" | "purple" | "gradient";
}

export const GlowDivider: React.FC<GlowDividerProps> = ({
  color = "gradient",
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative h-[1px] w-full my-6 overflow-hidden",
        {
          "bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent": color === "cyan",
          "bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent": color === "purple",
          "bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-[#8B5CF6]/40 via-50% to-transparent":
            color === "gradient",
        },
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 blur-[2px] opacity-75",
          {
            "bg-[#00E5FF]/30": color === "cyan",
            "bg-[#8B5CF6]/30": color === "purple",
            "bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-[#8B5CF6]/20 to-transparent":
              color === "gradient",
          }
        )}
      />
    </div>
  );
};
