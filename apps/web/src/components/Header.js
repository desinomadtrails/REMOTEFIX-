import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@remotefix/ui";
export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const storedToken = localStorage.getItem("rf_token");
        const storedUser = localStorage.getItem("rf_user");
        if (storedToken && storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setToken(storedToken);
                setUserRole(userObj.role);
            }
            catch {
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
    return (_jsxs("header", { className: "sticky top-0 z-40 w-full bg-[#030712]/70 backdrop-blur-md border-b border-[#374151]/50 transition-all duration-300", children: [_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [_jsx("div", { className: "p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 border border-primary/20 transition-all", children: _jsx(Shield, { className: "w-5 h-5 text-primary animate-pulse" }) }), _jsxs("span", { className: "font-display text-xl font-bold tracking-tight text-text", children: ["Remote", _jsx("span", { className: "text-primary", children: "Fix" })] })] }), _jsxs("nav", { className: "hidden md:flex items-center gap-8", children: [_jsx(Link, { to: "/", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "Home" }), _jsx(Link, { to: "/services", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "Services" }), _jsx(Link, { to: "/pricing", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "Pricing" }), _jsx(Link, { to: "/faq", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "FAQ" }), _jsx(Link, { to: "/blog", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "Blog" }), _jsx(Link, { to: "/contact", className: "text-sm font-medium text-muted hover:text-text transition-colors", children: "Contact" })] }), _jsx("div", { className: "hidden md:flex items-center gap-4", children: token ? (_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-2", onClick: () => navigate(userRole === "engineer" ? "/engineer" : "/customer"), children: [_jsx(LayoutDashboard, { size: 16 }), "Dashboard"] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex items-center gap-2 text-danger hover:text-danger hover:bg-danger/10", onClick: handleLogout, children: [_jsx(LogOut, { size: 16 }), "Sign Out"] })] })) : (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/login", className: "text-sm font-medium text-muted hover:text-text transition-colors px-3 py-2", children: "Sign In" }), _jsx(Button, { variant: "primary", size: "sm", onClick: () => navigate("/book"), children: "Book Support" })] })) }), _jsx("button", { onClick: () => setIsOpen(!isOpen), className: "md:hidden p-2 text-muted hover:text-text focus:outline-none cursor-pointer", children: isOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) })] }), isOpen && (_jsxs("div", { className: "md:hidden glass border-t border-[#374151]/50 px-4 pt-4 pb-6 space-y-4 flex flex-col", children: [_jsx(Link, { to: "/", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "Home" }), _jsx(Link, { to: "/services", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "Services" }), _jsx(Link, { to: "/pricing", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "Pricing" }), _jsx(Link, { to: "/faq", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "FAQ" }), _jsx(Link, { to: "/blog", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "Blog" }), _jsx(Link, { to: "/contact", onClick: () => setIsOpen(false), className: "text-base font-medium text-muted hover:text-text transition-colors", children: "Contact" }), _jsx("div", { className: "pt-4 border-t border-border/50 flex flex-col gap-3", children: token ? (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", className: "w-full flex items-center justify-center gap-2", onClick: () => {
                                        setIsOpen(false);
                                        navigate(userRole === "engineer" ? "/engineer" : "/customer");
                                    }, children: [_jsx(LayoutDashboard, { size: 16 }), "Dashboard"] }), _jsxs(Button, { variant: "ghost", className: "w-full flex items-center justify-center gap-2 text-danger hover:bg-danger/10", onClick: handleLogout, children: [_jsx(LogOut, { size: 16 }), "Sign Out"] })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", onClick: () => setIsOpen(false), className: "text-center py-2 text-base font-medium text-muted hover:text-text transition-colors", children: "Sign In" }), _jsx(Button, { variant: "primary", className: "w-full", onClick: () => { setIsOpen(false); navigate("/book"); }, children: "Book Support" })] })) })] }))] }));
};
//# sourceMappingURL=Header.js.map