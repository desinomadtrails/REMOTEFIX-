import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@remotefix/ui";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("rf_token");
    const storedUser = localStorage.getItem("rf_user");
    
    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setToken(storedToken);
        setUserRole(userObj.role);
      } catch {
        // Clear corrupt state
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rf_token");
    localStorage.removeItem("rf_user");
    setToken(null);
    setUserRole(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/70 backdrop-blur-md border-b border-[#374151]/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 border border-primary/20 transition-all">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-text">
            Remote<span className="text-primary">Fix</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted hover:text-text transition-colors">
            Dashboard
          </Link>
          <Link to="/settings" className="text-sm font-medium text-muted hover:text-text transition-colors">
            Settings
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-1 rounded border border-[#00E5FF]/20 font-mono">
              v1.0.0-MVP
            </span>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-muted hover:text-text focus:outline-none cursor-pointer"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="md:hidden glass border-t border-[#374151]/50 px-4 pt-4 pb-6 space-y-4 flex flex-col">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-muted hover:text-text transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="text-base font-medium text-muted hover:text-text transition-colors"
          >
            Settings
          </Link>
          <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
            {token ? (
              <>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(userRole === "engineer" ? "/engineer" : "/customer");
                  }}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-center gap-2 text-danger hover:bg-danger/10"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 text-base font-medium text-muted hover:text-text transition-colors"
                >
                  Sign In
                </Link>
                <Button variant="primary" className="w-full" onClick={() => { setIsOpen(false); navigate("/book"); }}>
                  Book Support
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
