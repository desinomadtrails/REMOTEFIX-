import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { Home } from "./pages/Home.js";
import { Services } from "./pages/Services.js";
import { BookService } from "./pages/BookService.js";
import { Pricing } from "./pages/Pricing.js";
import { FAQ } from "./pages/FAQ.js";
import { Blog } from "./pages/Blog.js";
import { Contact } from "./pages/Contact.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { CustomerDashboard } from "./pages/CustomerDashboard.js";
import { EngineerDashboard } from "./pages/EngineerDashboard.js";
import { Card } from "@remotefix/ui";
import "./index.css";
const queryClient = new QueryClient();
// Privacy Policy Component
const PrivacyPolicy = () => (_jsx("div", { className: "max-w-4xl mx-auto px-4 py-16 font-body", children: _jsxs(Card, { glowColor: "cyan", className: "p-8 md:p-12", children: [_jsx("h1", { className: "text-3xl font-black font-display text-text mb-6", children: "Privacy Policy" }), _jsxs("div", { className: "text-muted leading-relaxed space-y-6 text-sm", children: [_jsx("p", { children: "At RemoteFix, we respect your data and credentials. This privacy policy describes how we collect, process, and protect information when you book remote diagnostics or request physical on-site visits." }), _jsx("h2", { className: "text-xl font-bold font-display text-text mt-4", children: "1. Remote Desktop Session Security" }), _jsx("p", { children: "All remote diagnostics sessions are client-initiated. Session data is encrypted in transit using 256-bit AES mechanisms. Our technicians cannot establish connection loops without you entering active session codes. We do not store remote access logs beyond session termination." }), _jsx("h2", { className: "text-xl font-bold font-display text-text mt-4", children: "2. Database Records" }), _jsx("p", { children: "Your name, email address, company coordinates, and diagnostic records are stored on secure Azure SQL Database clusters. Financial transactions (invoices and credit card numbers) are processed through encrypted payment pathways; we do not store CVV digits or full card details in our database logs." })] })] }) }));
// Terms of Service Component
const TermsOfService = () => (_jsx("div", { className: "max-w-4xl mx-auto px-4 py-16 font-body", children: _jsxs(Card, { glowColor: "cyan", className: "p-8 md:p-12", children: [_jsx("h1", { className: "text-3xl font-black font-display text-text mb-6", children: "Terms of Service" }), _jsxs("div", { className: "text-muted leading-relaxed space-y-6 text-sm", children: [_jsx("p", { children: "By requesting remote assistance or scheduling on-site engineer dispatches, you agree to the following Service Terms of Service." }), _jsx("h2", { className: "text-xl font-bold font-display text-text mt-4", children: "1. Diagnostic Authorization" }), _jsx("p", { children: "You authorize RemoteFix technicians to perform software diagnostics, install patch updates, and audit local network settings. You agree to maintain a complete system backup before launching remote sessions. RemoteFix is not liable for data loss caused by pre-existing hardware failures." }), _jsx("h2", { className: "text-xl font-bold font-display text-text mt-4", children: "2. SLA Guarantee & Refunds" }), _jsx("p", { children: "If our technicians verify that the system issues described in your booking request cannot be resolved remotely (and you decide not to proceed with physical on-site visits), your diagnostic fee will be refunded immediately." })] })] }) }));
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "flex flex-col min-h-screen bg-[#030712] text-[#F9FAFB] selection:bg-[#00E5FF]/30 selection:text-[#00E5FF]", children: [_jsx(Header, {}), _jsx("main", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/services", element: _jsx(Services, {}) }), _jsx(Route, { path: "/book", element: _jsx(BookService, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(Pricing, {}) }), _jsx(Route, { path: "/faq", element: _jsx(FAQ, {}) }), _jsx(Route, { path: "/blog", element: _jsx(Blog, {}) }), _jsx(Route, { path: "/contact", element: _jsx(Contact, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/customer", element: _jsx(CustomerDashboard, {}) }), _jsx(Route, { path: "/engineer", element: _jsx(EngineerDashboard, {}) }), _jsx(Route, { path: "/privacy", element: _jsx(PrivacyPolicy, {}) }), _jsx(Route, { path: "/terms", element: _jsx(TermsOfService, {}) })] }) }), _jsx(Footer, {})] }) }) }) }));
//# sourceMappingURL=main.js.map