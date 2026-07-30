import React, { useState, useEffect, Suspense, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Key, Mail, Terminal, LayoutDashboard, Calendar,
  Database, LogOut, CheckCircle, RefreshCcw, TrendingUp, Clock,
  UserCheck, DollarSign, Plus, AlertCircle, Search, CheckSquare,
  Square, ChevronLeft, ChevronRight, SlidersHorizontal, Users,
  Download, Edit2, Lock, Unlock, FileText, History, Wrench,
  Activity, Award, Package, AlertTriangle, Receipt, Printer,
  Percent, BarChart2, Bell, Settings, ClipboardList, Building2
} from "lucide-react";
import { Button, Card, Badge, Modal, Input, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";
import { NotificationBell } from "./notifications/NotificationsPage.js";

// ── Lazy-loaded tab pages ─────────────────────────────────────────
const OverviewPage    = lazy(() => import("./overview/OverviewPage.js").then(m => ({ default: m.OverviewPage })));
const OrganizationsPage = lazy(() => import("./organizations/OrganizationsPage.js").then(m => ({ default: m.OrganizationsPage })));
const AssetsPage      = lazy(() => import("./assets/AssetsPage.js").then(m => ({ default: m.AssetsPage })));
const RmmPage         = lazy(() => import("./rmm/RmmPage.js").then(m => ({ default: m.RmmPage })));
const SlaPage         = lazy(() => import("./sla/SlaPage.js").then(m => ({ default: m.SlaPage })));
const BookingsPage    = lazy(() => import("./bookings/BookingsPage.js").then(m => ({ default: m.BookingsPage })));
const CustomersPage   = lazy(() => import("./customers/CustomersPage.js").then(m => ({ default: m.CustomersPage })));
const TechniciansPage = lazy(() => import("./technicians/TechniciansPage.js").then(m => ({ default: m.TechniciansPage })));
const InventoryPage   = lazy(() => import("./inventory/InventoryPage.js").then(m => ({ default: m.InventoryPage })));
const BillingPage     = lazy(() => import("./billing/BillingPage.js").then(m => ({ default: m.BillingPage })));
const ServicesPage    = lazy(() => import("./services/ServicesPage.js").then(m => ({ default: m.ServicesPage })));
const LogsPage        = lazy(() => import("./logs/LogsPage.js").then(m => ({ default: m.LogsPage })));
const ReportsPage     = lazy(() => import("./reports/ReportsPage.js").then(m => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import("./notifications/NotificationsPage.js").then(m => ({ default: m.NotificationsPage })));
const SettingsPage    = lazy(() => import("./settings/SettingsPage.js").then(m => ({ default: m.SettingsPage })));

// ── Tab definition ────────────────────────────────────────────────
type TabKey =
  | "overview" | "organizations" | "assets" | "rmm" | "sla" | "bookings" | "customers" | "technicians"
  | "inventory" | "billing" | "reports" | "notifications"
  | "settings" | "services" | "logs";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview",       label: "Analytics",        icon: <LayoutDashboard size={14} /> },
  { key: "organizations",  label: "Organizations",    icon: <Building2 size={14} /> },
  { key: "assets",         label: "Assets ITAM",      icon: <Package size={14} /> },
  { key: "rmm",            label: "RMM Agents",       icon: <Activity size={14} /> },
  { key: "sla",            label: "SLA Policies",     icon: <Clock size={14} /> },
  { key: "bookings",       label: "Booking Queue",     icon: <Calendar size={14} /> },
  { key: "customers",      label: "Customers",         icon: <Users size={14} /> },
  { key: "technicians",    label: "Technicians",       icon: <Wrench size={14} /> },
  { key: "inventory",      label: "Inventory",         icon: <Package size={14} /> },
  { key: "billing",        label: "Billing",           icon: <Receipt size={14} /> },
  { key: "reports",        label: "Reports",           icon: <BarChart2 size={14} /> },
  { key: "notifications",  label: "Notifications",     icon: <Bell size={14} /> },
  { key: "settings",       label: "Settings",          icon: <Settings size={14} /> },
  { key: "services",       label: "Services",          icon: <Database size={14} /> },
  { key: "logs",           label: "Audit Logs",        icon: <Terminal size={14} /> },
];

// ── Loading skeleton for Suspense fallback ────────────────────────
const TabSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-white/5 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-40 bg-white/5 rounded-xl" />
      <div className="h-40 bg-white/5 rounded-xl" />
    </div>
  </div>
);

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertTriangle size={40} className="text-danger mb-4" />
          <h3 className="text-lg font-bold text-text font-display">Something went wrong</h3>
          <p className="text-xs text-muted mt-2 max-w-sm">{this.state.error}</p>
          <Button variant="outline" size="sm" className="mt-6" onClick={() => this.setState({ hasError: false, error: "" })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ══════════════════════════════════════════════════════════════════
// Main Dashboard Shell
// ══════════════════════════════════════════════════════════════════
export const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const queryClient = useQueryClient();

  // ── Auth bootstrapping ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("rf_token");
    const userStr = localStorage.getItem("rf_user");
    if (token && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.role === "admin") setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rf_token");
    localStorage.removeItem("rf_user");
    setIsAuthenticated(false);
  };

  // ── Login screen ────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20 text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
            <Shield className="w-3.5 h-3.5" />
            Administrative Control Panel
          </div>
          <h1 className="text-3xl font-black font-display text-text">RemoteFix Admin</h1>
          <p className="text-xs text-muted font-body mt-2">Secure sign-in for platform managers.</p>
        </div>

        {loginError && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <Card className="flex flex-col gap-5" glowColor="purple">
            <div className="relative">
              <Input label="Administrator Email" type="email" placeholder="admin@remotefix.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
              <Mail className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>
            <div className="relative">
              <Input label="Admin Password" type="password" placeholder="adminpassword" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
              <Key className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>
            <Button variant="primary" type="submit" className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
              Authenticate Credentials
            </Button>
            <div className="bg-[#111827]/40 border border-border/80 rounded-lg p-4 font-body text-xs text-muted leading-relaxed mt-2">
              <span className="block font-semibold text-text mb-1">Developer Credentials:</span>
              Email: <code className="text-primary font-mono select-all">admin@remotefix.com</code><br />
              Password: <code className="text-primary font-mono select-all">adminpassword</code>
            </div>
          </Card>
        </form>
      </div>
    );
  }

  // ── Authenticated shell ─────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5 mb-6 font-body">
        <div>
          <h1 className="text-2xl font-black font-display text-text">RemoteFix Admin Suite</h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
            <span>Control Center: <span className="text-success font-semibold">Active</span></span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono text-primary">
              <Building2 size={12} /> Tenant: <strong className="text-text font-display">Global SuperTenant</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell onClick={() => setActiveTab("notifications")} />
          <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10 flex items-center gap-2" onClick={handleLogout}>
            <LogOut size={15} /> Lock Suite
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border/30 pb-0 mb-8 overflow-x-auto flex-nowrap scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 font-display text-xs font-semibold px-3 py-2.5 border-b-2 cursor-pointer transition-all shrink-0 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-secondary text-secondary bg-secondary/5 rounded-t-lg"
                : "border-transparent text-muted hover:text-text hover:bg-white/3 rounded-t-lg"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Lazy Tab Content */}
      <ErrorBoundary>
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === "overview"       && <OverviewPage />}
          {activeTab === "organizations"  && <OrganizationsPage />}
          {activeTab === "assets"         && <AssetsPage />}
          {activeTab === "rmm"            && <RmmPage />}
          {activeTab === "sla"            && <SlaPage />}
          {activeTab === "bookings"       && <BookingsPage />}
          {activeTab === "customers"      && <CustomersPage />}
          {activeTab === "technicians"    && <TechniciansPage />}
          {activeTab === "inventory"      && <InventoryPage />}
          {activeTab === "billing"        && <BillingPage />}
          {activeTab === "reports"        && <ReportsPage />}
          {activeTab === "notifications"  && <NotificationsPage />}
          {activeTab === "settings"       && <SettingsPage />}
          {activeTab === "services"       && <ServicesPage />}
          {activeTab === "logs"           && <LogsPage />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
