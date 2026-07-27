import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Shield, 
  Key, 
  Mail, 
  Terminal, 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Database, 
  LogOut, 
  CheckCircle, 
  RefreshCcw, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  DollarSign, 
  Plus, 
  AlertCircle 
} from "lucide-react";
import { Button, Card, Badge, Modal, Input, GlowDivider, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services" | "logs">("overview");
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
      } catch {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_user");
      }
    }
  }, []);

  // Admin login handler
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
    mutationFn: (payload: { id: string; status: string; engineerId?: string }) =>
      api.updateBookingStatus(payload.id, { status: payload.status, engineerId: payload.engineerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
  });

  const toggleServiceMutation = useMutation({
    mutationFn: (id: string) => api.toggleService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload: any) => api.createService(payload),
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

  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !serviceDesc || !servicePrice) return;
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
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0);

  const activeBookingsCount = (bookingsData || []).filter(
    (b: any) => b.status === "pending" || b.status === "assigned" || b.status === "in_progress"
  ).length;

  const completedJobsCount = (bookingsData || []).filter((b: any) => b.status === "completed").length;

  // Filter pending / unassigned bookings
  const pendingRequests = (bookingsData || []).filter((b: any) => b.status === "pending");

  // Get recent 4 bookings
  const recentJobs = (bookingsData || []).slice(0, 4);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20 text-xs font-semibold uppercase tracking-wider text-secondary mb-4">
            <Shield className="w-3.5 h-3.5" />
            Administrative Control Panel
          </div>
          <h1 className="text-3xl font-black font-display text-text">RemoteFix Admin</h1>
          <p className="text-xs text-muted font-body mt-2">
            Secure sign-in for platform managers.
          </p>
        </div>

        {loginError && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <Card className="flex flex-col gap-5" glowColor="purple">
            <div className="relative">
              <Input
                label="Administrator Email"
                type="email"
                placeholder="admin@remotefix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
              <Mail className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>

            <div className="relative">
              <Input
                label="Admin Password"
                type="password"
                placeholder="adminpassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
              <Key className="absolute left-3.5 top-10.5 text-muted w-4.5 h-4.5" />
            </div>

            <Button variant="primary" type="submit" className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
              Authenticate Credentials
            </Button>

            <div className="bg-[#111827]/40 border border-border/80 rounded-lg p-4 font-body text-xs text-muted leading-relaxed mt-2">
              <span className="block font-semibold text-text mb-1">Developer Credentials Checklist:</span>
              Email: <code className="text-primary font-mono select-all">admin@remotefix.com</code><br />
              Password: <code className="text-primary font-mono select-all">adminpassword</code>
            </div>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black font-display text-text">Administrative Suite</h1>
          <span className="text-xs text-muted font-body mt-0.5">Control Center Mode: <span className="text-success font-semibold">Active</span></span>
        </div>
        <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10 flex items-center gap-2" onClick={handleLogout}>
          <LogOut size={16} />
          Lock Suite
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/40 pb-4 mb-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "overview" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <LayoutDashboard size={16} />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "bookings" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Calendar size={16} />
          Booking Queue
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "services" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Database size={16} />
          Services Catalog
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "logs" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Terminal size={16} />
          Audit Logs
        </button>
      </div>

      {/* OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8 font-body">
          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card glowColor="purple">
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Revenue</span>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="text-secondary w-5 h-5" />
                <div className="text-2xl font-black font-display text-text">{formatCurrency(totalRevenue)}</div>
              </div>
            </Card>
            <Card glowColor="purple">
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Active Dispatches</span>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="text-secondary w-5 h-5" />
                <div className="text-2xl font-black font-display text-text">{activeBookingsCount}</div>
              </div>
            </Card>
            <Card glowColor="purple">
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Pending Allocations</span>
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="text-secondary w-5 h-5" />
                <div className="text-2xl font-black font-display text-text">{pendingRequests.length}</div>
              </div>
            </Card>
            <Card glowColor="purple">
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Completed Repairs</span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle className="text-secondary w-5 h-5" />
                <div className="text-2xl font-black font-display text-text">{completedJobsCount}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SVG Charts Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card glowColor="purple" className="p-6">
                <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-secondary" />
                  Monthly Revenue Trend (SaaS Analytics)
                </h3>
                
                {/* SVG Line Graph */}
                <div className="relative w-full h-[200px] border-b border-l border-border/60 bg-[#111827]/40 rounded p-4 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Background Grid Lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    
                    {/* Graph Area */}
                    <path
                      d="M 10 150 L 10 130 Q 90 90 130 110 T 250 50 T 390 30 L 390 150 Z"
                      fill="url(#gradient-area)"
                    />
                    
                    {/* Graph Line */}
                    <path
                      d="M 10 130 Q 90 90 130 110 T 250 50 T 390 30"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3.5"
                    />

                    {/* Nodes */}
                    <circle cx="10" cy="130" r="4.5" fill="#a78bfa" />
                    <circle cx="130" cy="110" r="4.5" fill="#a78bfa" />
                    <circle cx="250" cy="50" r="4.5" fill="#a78bfa" />
                    <circle cx="390" cy="30" r="4.5" fill="#a78bfa" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-2 px-1">
                  <span>Q1 2026</span>
                  <span>Q2 2026</span>
                  <span>Q3 2026</span>
                  <span>Q4 2026 (Est.)</span>
                </div>
              </Card>
            </div>

            {/* Quick Actions Card */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Card glowColor="purple" className="p-6">
                <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider">Quick Actions Center</h3>
                <div className="flex flex-col gap-3">
                  <Button variant="cyber" size="sm" className="w-full flex items-center justify-start gap-2" onClick={() => setNewServiceOpen(true)}>
                    <Plus size={14} />
                    Add Service Catalog Item
                  </Button>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-start gap-2" onClick={() => setActiveTab("bookings")}>
                    <UserCheck size={14} className="text-secondary" />
                    Assign Pending Bookings ({pendingRequests.length})
                  </Button>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-start gap-2" onClick={() => setActiveTab("logs")}>
                    <Terminal size={14} className="text-secondary" />
                    Review Audit Logs
                  </Button>
                </div>
              </Card>

              {/* Seed status card */}
              <Card glowColor="none" className="p-6">
                <h3 className="text-sm font-bold font-display text-text mb-2">Seed Utility</h3>
                {seedingSuccess ? (
                  <div className="bg-success/15 border border-success/30 text-success text-xs rounded p-2.5 flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    Database successfully injected!
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full text-xs text-secondary border border-secondary/20 hover:bg-secondary/10 flex items-center justify-center gap-1.5" onClick={() => seedDatabaseMutation.mutate()} isLoading={seedDatabaseMutation.isPending}>
                    <RefreshCcw size={12} />
                    Inject Mock Datasets
                  </Button>
                )}
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Unassigned / Pending Bookings */}
            <Card glowColor="none">
              <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-3">
                <Clock size={16} className="text-secondary" />
                Unassigned Pending Incidents ({pendingRequests.length})
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-muted italic">All active customer requests have been assigned to technicians.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingRequests.slice(0, 3).map((b: any) => (
                    <div key={b.id} className="bg-[#111827]/40 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-primary font-bold block">{b.ticketId}</span>
                        <span className="text-text font-semibold block mt-0.5">{b.name} ({b.deviceType || b.operatingSystem})</span>
                      </div>
                      <Button variant="cyber" size="sm" className="text-[10px] py-1 px-3" onClick={() => setActiveTab("bookings")}>
                        Assign Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Jobs list */}
            <Card glowColor="none">
              <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-3">
                <ClipboardList size={16} className="text-secondary" />
                Recent Operations Log
              </h3>
              {recentJobs.length === 0 ? (
                <p className="text-xs text-muted italic">No bookings logged in platform.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentJobs.map((b: any) => (
                    <div key={b.id} className="bg-[#111827]/40 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-muted">{b.ticketId || "GUEST"}</span>
                          <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="py-0 text-[9px]">
                            {b.status}
                          </Badge>
                        </div>
                        <span className="text-text font-semibold block mt-1">{b.name} - {b.preferredDate}</span>
                      </div>
                      <span className="text-muted text-[10px]">{b.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* BOOKING QUEUE */}
      {activeTab === "bookings" && (
        <div>
          {bookingsLoading ? (
            <div>Loading booking registers...</div>
          ) : !bookingsData || bookingsData.length === 0 ? (
            <Card className="text-center py-12 text-muted font-body">No bookings found.</Card>
          ) : (
            <div className="flex flex-col gap-4">
              {bookingsData.map((b: any) => (
                <Card key={b.id} glowColor="none" className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="font-body text-sm space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                        {b.ticketId || "INCIDENT"}
                      </span>
                      <span className="font-display font-bold text-base text-text">{b.name}</span>
                      <Badge variant={b.priority === "emergency" ? "danger" : b.priority === "high" ? "warning" : "info"}>
                        {b.priority || "normal"}
                      </Badge>
                      <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"}>
                        {b.status}
                      </Badge>
                    </div>
                    <div>Email: <span className="text-text font-semibold">{b.email}</span> | Phone: <span className="text-text font-semibold">{b.phone}</span></div>
                    <div>
                      Device: <span className="text-text font-semibold">{b.brand ? `${b.brand} ${b.model} (${b.deviceType})` : b.operatingSystem}</span>
                      {b.serialNumber && <span> | S/N: <span className="text-text font-semibold">{b.serialNumber}</span></span>}
                    </div>
                    <div>
                      Scheduled: <span className="text-text font-semibold">{b.preferredDate} ({b.preferredTime})</span> | Created: <span className="text-text font-semibold">{formatDateTime(b.createdAt)}</span>
                    </div>
                    {b.address && <div>Address: <span className="text-text font-semibold">{b.address}</span></div>}
                    <div className="text-xs text-muted max-w-xl truncate mt-1">Faults: {b.problemDescription}</div>
                    
                    {/* Render Remarks if completed */}
                    {b.remarks && (
                      <div className="text-xs text-primary mt-1 border-t border-border/20 pt-1">
                        Technician Remarks: <span className="text-text">{b.remarks}</span>
                        {b.partsUsed && <span> | Parts: <span className="text-text">{b.partsUsed}</span></span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full sm:w-auto mt-2 md:mt-0">
                    {/* Engineer assignment simulator */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted font-body">Assign:</span>
                      <select
                        className="bg-[#111827]/60 border border-border text-xs text-text font-semibold rounded p-1"
                        value={b.engineerId || ""}
                        onChange={(e) =>
                          updateBookingMutation.mutate({
                            id: b.id,
                            status: e.target.value ? "assigned" : "pending",
                            engineerId: e.target.value || undefined,
                          })
                        }
                      >
                        <option value="">-- Unassigned --</option>
                        <option value="eng-1">Elena Vance (Security Specialist)</option>
                        <option value="eng-2">John Freeman (Network Lead)</option>
                      </select>
                    </div>

                    <div className="flex gap-1.5">
                      {b.status !== "completed" && b.status !== "cancelled" && (
                        <>
                          <Button variant="ghost" size="sm" className="text-xs text-success hover:bg-success/15" onClick={() => updateBookingMutation.mutate({ id: b.id, status: "completed" })}>
                            Complete
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-danger hover:bg-danger/15" onClick={() => updateBookingMutation.mutate({ id: b.id, status: "cancelled" })}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SERVICES CATALOG */}
      {activeTab === "services" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-text">Service Catalog Editor</h2>
            <Button variant="cyber" size="sm" onClick={() => setNewServiceOpen(true)}>
              Create Service Item
            </Button>
          </div>

          {servicesLoading ? (
            <div>Loading service list...</div>
          ) : !servicesData || servicesData.length === 0 ? (
            <Card className="text-center py-12 text-muted font-body">No services registered.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.map((s: any) => (
                <Card key={s.id} glowColor="none" className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-primary font-display uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                    <Badge variant={s.isActive ? "success" : "danger"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <h3 className="text-lg font-bold font-display text-text">{s.name}</h3>
                  <p className="text-xs text-muted font-body mt-2 leading-relaxed flex-grow">{s.description}</p>
                  <div className="text-lg font-black font-display text-text mt-4">{formatCurrency(parseFloat(s.price))}</div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 text-xs"
                    onClick={() => toggleServiceMutation.mutate(s.id)}
                    isLoading={toggleServiceMutation.isPending}
                  >
                    Toggle Active Status
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIT LOGS */}
      {activeTab === "logs" && (
        <Card glowColor="none" className="p-6">
          <h2 className="text-xl font-bold font-display text-text mb-6">Platform Security Log</h2>
          {logsLoading ? (
            <div>Loading audit log...</div>
          ) : !logsData || logsData.length === 0 ? (
            <div className="text-center py-8 text-muted font-body">No security audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body text-xs text-left text-muted border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-text font-semibold font-display uppercase">
                    <th className="pb-3 pr-4">Action</th>
                    <th className="pb-3 pr-4">IP Address</th>
                    <th className="pb-3 pr-4">Actor</th>
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.map((log: any) => (
                    <tr key={log.id} className="border-b border-border/30 hover:bg-[#111827]/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-primary">{log.action}</td>
                      <td className="py-3.5 pr-4 font-mono">{log.ipAddress || "127.0.0.1"}</td>
                      <td className="py-3.5 pr-4">{log.userEmail ? `${log.userEmail} (${log.userRole})` : "System / Guest"}</td>
                      <td className="py-3.5 pr-4 truncate max-w-xs">{log.details}</td>
                      <td className="py-3.5">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* CREATE SERVICE MODAL */}
      <Modal isOpen={newServiceOpen} onClose={() => setNewServiceOpen(false)} title="Create Catalog Service">
        <form onSubmit={handleCreateServiceSubmit} className="flex flex-col gap-4 font-body">
          <Input
            label="Service Name *"
            placeholder="e.g. Server Migration Consultation"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($) *"
              placeholder="199.00"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              required
            />
            <Input
              label="Est. Duration (Minutes)"
              placeholder="60"
              value={serviceDuration}
              onChange={(e) => setServiceDuration(e.target.value)}
              required
            />
          </div>

          <Select
            label="Category"
            options={[
              { label: "Support", value: "Support" },
              { label: "Networking", value: "Networking" },
              { label: "Security", value: "Security" },
              { label: "Installation", value: "Installation" },
              { label: "Storage", value: "Storage" },
              { label: "Consulting", value: "Consulting" },
            ]}
            value={serviceCategory}
            onChange={(e: any) => setServiceCategory(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display text-muted">Service Description *</label>
            <textarea
              rows={4}
              placeholder="Details regarding what tasks are executed during this service incident..."
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text outline-none"
            />
          </div>

          <Button variant="primary" type="submit" isLoading={createServiceMutation.isPending} className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Add Service Item
          </Button>
        </form>
      </Modal>
    </div>
  );
};
