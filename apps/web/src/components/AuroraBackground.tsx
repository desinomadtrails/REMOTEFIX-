import React from "react";

export const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#030712] pointer-events-none">
      {/* Background aurora gradients */}
      <div 
        className="absolute -top-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-[#00E5FF]/10 blur-[120px] opacity-75"
        style={{
          animation: "pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <div 
        className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#8B5CF6]/10 blur-[120px] opacity-75"
        style={{
          animation: "pulse 16s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      {/* Grid overlay for tech look */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
    </div>
  );
};
