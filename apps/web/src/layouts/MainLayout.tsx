import React from "react";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-[#F9FAFB] selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
