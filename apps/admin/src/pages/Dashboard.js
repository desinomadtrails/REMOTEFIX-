import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Key, Mail, Terminal, LayoutDashboard, Calendar, Database, LogOut, CheckCircle, RefreshCcw } from "lucide-react";
import { Button, Card, Badge, Modal, Input, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";
export const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const queryClient = useQueryClient();
    // Dialog State
    const [newServiceOpen, setNewServiceOpen] = useState(false);
    const [serviceName, setServiceName] = useState("");
    const [serviceDesc, setServiceDesc] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceCategory, setServiceCategory] = useState("Support");
    const [serviceDuration, setServiceDuration] = useState("60");
    const [seedingSuccess, setSeedingSuccess] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("rf_token");
        const userStr = localStorage.getItem("rf_user");
        if (token && userStr) {
            try {
                const userObj = JSON.parse(userStr);
                if (userObj.role === "admin") {
                    setIsAuthenticated(true);
                }
            }
            catch {
                localStorage.removeItem("rf_token");
                localStorage.removeItem("rf_user");
            }
        }
    }, []);
    // Admin login handler
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError("");
        try {
            const data = await api.login({ email, password });
            if (data.user.role !== "admin") {
                setLoginError("Unauthorized: Only administrators are permitted.");
                return;
            }
            localStorage.setItem("rf_token", data.token);
            localStorage.setItem("rf_user", JSON.stringify(data.user));
            setIsAuthenticated(true);
        }
        catch (err) {
            setLoginError(err.message || "Invalid credentials.");
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
        setIsAuthenticated(false);
    };
    // Queries
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["admin-bookings"],
        queryFn: async () => {
            const res = await api.getBookings();
            return res.bookings || [];
        },
        enabled: isAuthenticated,
    });
    const { data: servicesData, isLoading: servicesLoading } = useQuery({
        queryKey: ["admin-services"],
        queryFn: async () => {
            const res = await api.getAllServicesAdmin();
            return res.services || [];
        },
        enabled: isAuthenticated,
    });
    const { data: invoicesData } = useQuery({
        queryKey: ["admin-invoices"],
        queryFn: async () => {
            const res = await api.getInvoices();
            return res.invoices || [];
        },
        enabled: isAuthenticated,
    });
    const { data: logsData, isLoading: logsLoading } = useQuery({
        queryKey: ["admin-logs"],
        queryFn: async () => {
            const res = await api.getAuditLogs();
            return res.logs || [];
        },
        enabled: isAuthenticated,
    });
    // Mutations
    const updateBookingMutation = useMutation({
        mutationFn: (payload) => api.updateBookingStatus(payload.id, { status: payload.status, engineerId: payload.engineerId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
        },
    });
    const toggleServiceMutation = useMutation({
        mutationFn: (id) => api.toggleService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
        },
    });
    const createServiceMutation = useMutation({
        mutationFn: (payload) => api.createService(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
            setNewServiceOpen(false);
            setServiceName("");
            setServiceDesc("");
            setServicePrice("");
        },
    });
    const seedDatabaseMutation = useMutation({
        mutationFn: () => api.seedDatabase(),
        onSuccess: () => {
            setSeedingSuccess(true);
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
            setTimeout(() => setSeedingSuccess(false), 3000);
        },
    });
    const handleCreateServiceSubmit = (e) => {
        e.preventDefault();
        if (!serviceName || !serviceDesc || !servicePrice)
            return;
        createServiceMutation.mutate({
            name: serviceName,
            description: serviceDesc,
            price: parseFloat(servicePrice),
            category: serviceCategory,
            estimatedDurationMinutes: parseInt(serviceDuration),
            isActive: true,
        });
    };
    // Metrics calculations
    const totalRevenue = (invoicesData || [])
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const activeBookingsCount = (bookingsData || []).filter((b) => b.status === "pending" || b.status === "assigned" || b.status === "in_progress").length;
    const completedJobsCount = (bookingsData || []).filter((b) => b.status === "completed").length;
    if (!isAuthenticated) {
        return (_jsxs("div", { className: "max-w-md mx-auto px-4 py-24", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20 text-xs font-semibold uppercase tracking-wider text-secondary mb-4", children: [_jsx(Shield, { className: "w-3.5 h-3.5" }), "Administrative Control Panel"] }), _jsx("h1", { className: "text-3xl font-black font-display text-text", children: "RemoteFix Admin" }), _jsx("p", { className: "text-xs text-muted font-body mt-2", children: "Secure sign-in for platform managers." })] }), loginError && (_jsx("div", { className: "bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body", children: loginError })), _jsx("form", { onSubmit: handleLoginSubmit, children: _jsxs(Card, { className: "flex flex-col gap-5", glowColor: "purple", children: [_jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Administrator Email", type: "email", placeholder: "admin@remotefix.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "pl-10" }), _jsx(Mail, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Admin Password", type: "password", placeholder: "adminpassword", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "pl-10" }), _jsx(Key, { className: "absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" })] }), _jsx(Button, { variant: "primary", type: "submit", className: "w-full mt-2", style: { backgroundColor: "#8B5CF6", color: "white" }, children: "Authenticate Credentials" }), _jsxs("div", { className: "bg-[#111827]/40 border border-border/80 rounded-lg p-4 font-body text-xs text-muted leading-relaxed mt-2", children: [_jsx("span", { className: "block font-semibold text-text mb-1", children: "Developer Credentials Checklist:" }), "Email: ", _jsx("code", { className: "text-primary font-mono select-all", children: "admin@remotefix.com" }), _jsx("br", {}), "Password: ", _jsx("code", { className: "text-primary font-mono select-all", children: "adminpassword" })] })] }) })] }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-black font-display text-text", children: "Administrative Suite" }), _jsxs("span", { className: "text-xs text-muted font-body mt-0.5", children: ["Control Center Mode: ", _jsx("span", { className: "text-success font-semibold", children: "Active" })] })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "text-danger hover:bg-danger/10 flex items-center gap-2", onClick: handleLogout, children: [_jsx(LogOut, { size: 16 }), "Lock Suite"] })] }), _jsxs("div", { className: "flex gap-4 border-b border-border/40 pb-4 mb-8", children: [_jsxs("button", { onClick: () => setActiveTab("overview"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "overview" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"}`, children: [_jsx(LayoutDashboard, { size: 16 }), "Analytics"] }), _jsxs("button", { onClick: () => setActiveTab("bookings"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "bookings" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"}`, children: [_jsx(Calendar, { size: 16 }), "Booking Queue"] }), _jsxs("button", { onClick: () => setActiveTab("services"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "services" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"}`, children: [_jsx(Database, { size: 16 }), "Services Catalog"] }), _jsxs("button", { onClick: () => setActiveTab("logs"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "logs" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"}`, children: [_jsx(Terminal, { size: 16 }), "Audit Logs"] })] }), activeTab === "overview" && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { glowColor: "purple", children: [_jsx("span", { className: "text-xs text-muted font-body uppercase", children: "Consolidated Revenue" }), _jsx("div", { className: "text-3xl font-black font-display text-text mt-2", children: formatCurrency(totalRevenue) })] }), _jsxs(Card, { glowColor: "purple", children: [_jsx("span", { className: "text-xs text-muted font-body uppercase", children: "Active Dispatches" }), _jsx("div", { className: "text-3xl font-black font-display text-text mt-2", children: activeBookingsCount })] }), _jsxs(Card, { glowColor: "purple", children: [_jsx("span", { className: "text-xs text-muted font-body uppercase", children: "Completed Repairs" }), _jsx("div", { className: "text-3xl font-black font-display text-text mt-2", children: completedJobsCount })] })] }), _jsxs(Card, { glowColor: "none", className: "p-6", children: [_jsx("h3", { className: "text-lg font-bold font-display text-text mb-4", children: "Database Operations" }), _jsx("p", { className: "text-sm text-muted font-body leading-relaxed max-w-xl mb-4", children: "Need to populate the database schema with active services and test support tickets? Use the seed utility below." }), seedingSuccess ? (_jsxs("div", { className: "bg-success/15 border border-success/30 text-success text-sm rounded-lg p-4 flex items-center gap-2 max-w-md", children: [_jsx(CheckCircle, { size: 18 }), "Initial service catalog successfully injected into Azure SQL!"] })) : (_jsxs(Button, { variant: "cyber", className: "flex items-center gap-2", onClick: () => seedDatabaseMutation.mutate(), isLoading: seedDatabaseMutation.isPending, children: [_jsx(RefreshCcw, { size: 16 }), "Seed Initial Services Catalog"] }))] })] })), activeTab === "bookings" && (_jsx("div", { children: bookingsLoading ? (_jsx("div", { children: "Loading booking registers..." })) : !bookingsData || bookingsData.length === 0 ? (_jsx(Card, { className: "text-center py-12 text-muted font-body", children: "No bookings found." })) : (_jsx("div", { className: "flex flex-col gap-4", children: bookingsData.map((b) => (_jsxs(Card, { glowColor: "none", className: "p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { className: "font-body text-sm space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-display font-bold text-base text-text", children: b.name }), _jsx(Badge, { variant: b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning", children: b.status })] }), _jsxs("div", { children: ["Email: ", _jsx("span", { className: "text-text font-semibold", children: b.email }), " | Phone: ", _jsx("span", { className: "text-text font-semibold", children: b.phone })] }), _jsxs("div", { children: ["OS: ", _jsx("span", { className: "text-text font-semibold", children: b.operatingSystem }), " | Scheduled: ", _jsxs("span", { className: "text-text font-semibold", children: [b.preferredDate, " (", b.preferredTime, ")"] })] }), _jsxs("div", { className: "text-xs text-muted max-w-xl truncate mt-1", children: ["Faults: ", b.problemDescription] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto mt-2 md:mt-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs text-muted font-body", children: "Assign:" }), _jsxs("select", { className: "bg-[#111827]/60 border border-border text-xs text-text font-semibold rounded p-1", value: b.engineerId || "", onChange: (e) => updateBookingMutation.mutate({
                                                    id: b.id,
                                                    status: e.target.value ? "assigned" : "pending",
                                                    engineerId: e.target.value || undefined,
                                                }), children: [_jsx("option", { value: "", children: "-- Unassigned --" }), _jsx("option", { value: "eng-1", children: "Elena Vance (Security Specialist)" }), _jsx("option", { value: "eng-2", children: "John Freeman (Network Lead)" })] })] }), _jsx("div", { className: "flex gap-1.5", children: b.status !== "completed" && b.status !== "cancelled" && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", className: "text-xs text-success hover:bg-success/15", onClick: () => updateBookingMutation.mutate({ id: b.id, status: "completed" }), children: "Complete" }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-xs text-danger hover:bg-danger/15", onClick: () => updateBookingMutation.mutate({ id: b.id, status: "cancelled" }), children: "Cancel" })] })) })] })] }, b.id))) })) })), activeTab === "services" && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold font-display text-text", children: "Service Catalog Editor" }), _jsx(Button, { variant: "cyber", size: "sm", onClick: () => setNewServiceOpen(true), children: "Create Service Item" })] }), servicesLoading ? (_jsx("div", { children: "Loading service list..." })) : !servicesData || servicesData.length === 0 ? (_jsx(Card, { className: "text-center py-12 text-muted font-body", children: "No services registered." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: servicesData.map((s) => (_jsxs(Card, { glowColor: "none", className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "text-xs font-semibold text-primary font-display uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded", children: s.category }), _jsx(Badge, { variant: s.isActive ? "success" : "danger", children: s.isActive ? "Active" : "Inactive" })] }), _jsx("h3", { className: "text-lg font-bold font-display text-text", children: s.name }), _jsx("p", { className: "text-xs text-muted font-body mt-2 leading-relaxed flex-grow", children: s.description }), _jsx("div", { className: "text-lg font-black font-display text-text mt-4", children: formatCurrency(parseFloat(s.price)) }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-4 text-xs", onClick: () => toggleServiceMutation.mutate(s.id), isLoading: toggleServiceMutation.isPending, children: "Toggle Active Status" })] }, s.id))) }))] })), activeTab === "logs" && (_jsxs(Card, { glowColor: "none", className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold font-display text-text mb-6", children: "Platform Security Log" }), logsLoading ? (_jsx("div", { children: "Loading audit log..." })) : !logsData || logsData.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted font-body", children: "No security audit logs found." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full font-body text-xs text-left text-muted border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/50 text-text font-semibold font-display uppercase", children: [_jsx("th", { className: "pb-3 pr-4", children: "Action" }), _jsx("th", { className: "pb-3 pr-4", children: "IP Address" }), _jsx("th", { className: "pb-3 pr-4", children: "Actor" }), _jsx("th", { className: "pb-3 pr-4", children: "Details" }), _jsx("th", { className: "pb-3", children: "Timestamp" })] }) }), _jsx("tbody", { children: logsData.map((log) => (_jsxs("tr", { className: "border-b border-border/30 hover:bg-[#111827]/30 transition-colors", children: [_jsx("td", { className: "py-3.5 pr-4 font-bold text-primary", children: log.action }), _jsx("td", { className: "py-3.5 pr-4 font-mono", children: log.ipAddress || "127.0.0.1" }), _jsx("td", { className: "py-3.5 pr-4", children: log.userEmail ? `${log.userEmail} (${log.userRole})` : "System / Guest" }), _jsx("td", { className: "py-3.5 pr-4 truncate max-w-xs", children: log.details }), _jsx("td", { className: "py-3.5", children: formatDateTime(log.createdAt) })] }, log.id))) })] }) }))] })), _jsx(Modal, { isOpen: newServiceOpen, onClose: () => setNewServiceOpen(false), title: "Create Catalog Service", children: _jsxs("form", { onSubmit: handleCreateServiceSubmit, className: "flex flex-col gap-4 font-body", children: [_jsx(Input, { label: "Service Name *", placeholder: "e.g. Server Migration Consultation", value: serviceName, onChange: (e) => setServiceName(e.target.value), required: true }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Price ($) *", placeholder: "199.00", value: servicePrice, onChange: (e) => setServicePrice(e.target.value), required: true }), _jsx(Input, { label: "Est. Duration (Minutes)", placeholder: "60", value: serviceDuration, onChange: (e) => setServiceDuration(e.target.value), required: true })] }), _jsx(Select, { label: "Category", options: [
                                { label: "Support", value: "Support" },
                                { label: "Networking", value: "Networking" },
                                { label: "Security", value: "Security" },
                                { label: "Installation", value: "Installation" },
                                { label: "Storage", value: "Storage" },
                                { label: "Consulting", value: "Consulting" },
                            ], value: serviceCategory, onChange: (e) => setServiceCategory(e.target.value) }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-sm font-medium font-display text-muted", children: "Service Description *" }), _jsx("textarea", { rows: 4, placeholder: "Details regarding what tasks are executed during this service incident...", value: serviceDesc, onChange: (e) => setServiceDesc(e.target.value), required: true, className: "w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text outline-none" })] }), _jsx(Button, { variant: "primary", type: "submit", isLoading: createServiceMutation.isPending, className: "w-full mt-4", style: { backgroundColor: "#8B5CF6", color: "white" }, children: "Add Service Item" })] }) })] }));
};
//# sourceMappingURL=Dashboard.js.map