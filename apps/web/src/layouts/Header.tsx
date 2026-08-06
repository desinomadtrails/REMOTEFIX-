import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Shield, Menu, X, LogOut, LayoutDashboard, Settings as SettingsIcon, Ticket, User, Wrench } from "lucide-react";
import { Button } from "@remotefix/ui";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("rf_token");
    const storedUser = localStorage.getItem("rf_user");

    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setToken(storedToken);
        setUserRole(userObj.role);
      } catch {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("rf_token");
    localStorage.removeItem("rf_user");
    setToken(null);
    setUserRole(null);
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { name: "Services", path: "/services" },
    { name: "Pricing", path: "/pricing" },
    { name: "FAQ", path: "/faq" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Track Ticket", path: "/track" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/80 backdrop-blur-md border-b border-[#374151]/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 border border-primary/20 transition-all">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-text">
            Remote<span className="text-primary">Fix</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-primary font-semibold" : "text-muted hover:text-text"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA & User Controls */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate(userRole === "engineer" ? "/engineer" : "/customer")}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted hover:text-text"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-danger hover:bg-danger/10"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-muted hover:text-text px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => navigate("/book")}
                glow
              >
                <Wrench size={16} />
                Book Support
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 text-muted hover:text-text focus:outline-none cursor-pointer"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="lg:hidden glass border-t border-[#374151]/50 px-4 pt-4 pb-6 space-y-3 flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-base font-medium transition-colors py-1 ${
                location.pathname === link.path ? "text-primary font-semibold" : "text-muted hover:text-text"
              }`}
            >
              {link.name}
            </Link>
          ))}

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
                  My Dashboard
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
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2 text-base font-medium text-muted hover:text-text border border-[#374151]/50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center py-2 text-base font-medium text-muted hover:text-text border border-[#374151]/50 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/book");
                  }}
                >
                  <Wrench size={16} />
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
