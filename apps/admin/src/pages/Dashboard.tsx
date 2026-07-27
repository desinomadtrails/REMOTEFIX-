import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Key, Mail, Terminal, LayoutDashboard, Calendar, ClipboardList, Database, LogOut, CheckCircle, RefreshCcw } from "lucide-react";
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card glowColor="purple">
              <span className="text-xs text-muted font-body uppercase">Consolidated Revenue</span>
              <div className="text-3xl font-black font-display text-text mt-2">{formatCurrency(totalRevenue)}</div>
            </Card>
            <Card glowColor="purple">
              <span className="text-xs text-muted font-body uppercase">Active Dispatches</span>
              <div className="text-3xl font-black font-display text-text mt-2">{activeBookingsCount}</div>
            </Card>
            <Card glowColor="purple">
              <span className="text-xs text-muted font-body uppercase">Completed Repairs</span>
              <div className="text-3xl font-black font-display text-text mt-2">{completedJobsCount}</div>
            </Card>
          </div>

          <Card glowColor="none" className="p-6">
            <h3 className="text-lg font-bold font-display text-text mb-4">Database Operations</h3>
            <p className="text-sm text-muted font-body leading-relaxed max-w-xl mb-4">
              Need to populate the database schema with active services and test support tickets? Use the seed utility below.
            </p>
            {seedingSuccess ? (
              <div className="bg-success/15 border border-success/30 text-success text-sm rounded-lg p-4 flex items-center gap-2 max-w-md">
                <CheckCircle size={18} />
                Initial service catalog successfully injected into Azure SQL!
              </div>
            ) : (
              <Button variant="cyber" className="flex items-center gap-2" onClick={() => seedDatabaseMutation.mutate()} isLoading={seedDatabaseMutation.isPending}>
                <RefreshCcw size={16} />
                Seed Initial Services Catalog
              </Button>
            )}
          </Card>
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
                        {b.ticketId || "LEGACY"}
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
