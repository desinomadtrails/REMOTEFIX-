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
  AlertCircle,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Users,
  Download,
  Edit2,
  Lock,
  Unlock,
  FileText,
  History
} from "lucide-react";
import { Button, Card, Badge, Modal, Input, GlowDivider, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services" | "logs" | "customers">("overview");
  const queryClient = useQueryClient();

  // Dialog State
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("Support");
  const [serviceDuration, setServiceDuration] = useState("60");
  const [seedingSuccess, setSeedingSuccess] = useState(false);

  // Search, Filters & Pagination States (Service Queue)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Bulk Selection State
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState("");

  // Customer Management States
  const [custSearchTerm, setCustSearchTerm] = useState("");
  const [custTypeFilter, setCustTypeFilter] = useState("all"); // 'all' | 'registered' | 'guest'
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Customer CRUD Dialog States
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [custFormName, setCustFormName] = useState("");
  const [custFormEmail, setCustFormEmail] = useState("");
  const [custFormPhone, setCustFormPhone] = useState("");
  const [custFormCompanyName, setCustFormCompanyName] = useState("");
  const [custFormBillingAddress, setCustFormBillingAddress] = useState("");
  const [custFormStatus, setCustFormStatus] = useState("active");

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

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const res = await api.getCustomers();
      return res.customers || [];
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
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setTimeout(() => setSeedingSuccess(false), 3000);
    },
  });

  // Customer Management Mutations
  const createCustomerMutation = useMutation({
    mutationFn: (payload: any) => api.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      setCustModalOpen(false);
      clearCustForm();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to create customer.");
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) => api.updateCustomer(payload.id, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      setCustModalOpen(false);
      clearCustForm();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update customer.");
    }
  });

  const toggleCustomerSuspensionMutation = useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to toggle status.");
    }
  });

  const clearCustForm = () => {
    setEditingCustomerId(null);
    setCustFormName("");
    setCustFormEmail("");
    setCustFormPhone("");
    setCustFormCompanyName("");
    setCustFormBillingAddress("");
    setCustFormStatus("active");
  };

  const handleOpenEditCustomer = (cust: any) => {
    setEditingCustomerId(cust.id);
    setCustFormName(cust.fullName);
    setCustFormEmail(cust.email);
    setCustFormPhone(cust.phone);
    setCustFormCompanyName(cust.companyName || "");
    setCustFormBillingAddress(cust.billingAddress || "");
    setCustFormStatus(cust.userStatus);
    setCustModalOpen(true);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custFormName || !custFormEmail || !custFormPhone) return;

    const payload = {
      fullName: custFormName,
      email: custFormEmail,
      phone: custFormPhone,
      companyName: custFormCompanyName || null,
      billingAddress: custFormBillingAddress || null,
      userStatus: custFormStatus,
    };

    if (editingCustomerId) {
      updateCustomerMutation.mutate({ id: editingCustomerId, body: payload });
    } else {
      createCustomerMutation.mutate(payload);
    }
  };

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

  // Search & Filtering logic for the Booking Queue
  const filteredBookings = (bookingsData || []).filter((b: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.ticketId || "").toLowerCase().includes(searchLower) ||
      b.name.toLowerCase().includes(searchLower) ||
      b.email.toLowerCase().includes(searchLower) ||
      b.phone.includes(searchLower) ||
      (b.problemDescription || "").toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || b.priority === priorityFilter;
    const matchesType = typeFilter === "all" || b.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Pagination calculation
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, typeFilter]);

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedBookingIds.length === paginatedBookings.length) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(paginatedBookings.map((b: any) => b.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedBookingIds.includes(id)) {
      setSelectedBookingIds(selectedBookingIds.filter(item => item !== id));
    } else {
      setSelectedBookingIds([...selectedBookingIds, id]);
    }
  };

  const handleApplyBulkAction = async () => {
    if (selectedBookingIds.length === 0 || !bulkActionType) return;

    let targetStatus = "";
    let targetEngineerId: string | undefined = undefined;

    if (bulkActionType === "complete") {
      targetStatus = "completed";
    } else if (bulkActionType === "cancel") {
      targetStatus = "cancelled";
    } else if (bulkActionType === "assign-elena") {
      targetStatus = "assigned";
      targetEngineerId = "eng-1";
    } else if (bulkActionType === "assign-john") {
      targetStatus = "assigned";
      targetEngineerId = "eng-2";
    }

    if (!targetStatus) return;

    for (const bookingId of selectedBookingIds) {
      await updateBookingMutation.mutateAsync({
        id: bookingId,
        status: targetStatus,
        engineerId: targetEngineerId
      });
    }

    setSelectedBookingIds([]);
    setBulkActionType("");
  };

  // Customer List Search & Filters logic
  const filteredCustomers = (customersData || []).filter((c: any) => {
    const searchLower = custSearchTerm.toLowerCase();
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchLower) ||
      (c.companyName || "").toLowerCase().includes(searchLower);

    const matchesType = 
      custTypeFilter === "all" ||
      (custTypeFilter === "registered" && !c.isGuest) ||
      (custTypeFilter === "guest" && c.isGuest);

    return matchesSearch && matchesType;
  });

  const selectedCustomer = (customersData || []).find((c: any) => c.id === selectedCustomerId);

  // Client-side CSV exporter
  const handleExportCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "Company Name", "Billing Address", "Type", "Status", "Bookings Count", "Total Revenue"];
    const rows = filteredCustomers.map((c: any) => [
      c.id,
      c.fullName,
      c.email,
      c.phone,
      c.companyName || "",
      c.billingAddress || "",
      c.isGuest ? "Guest" : "Registered",
      c.userStatus,
      c.bookingCount,
      c.totalSpent
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `remotefix_customers_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex gap-4 border-b border-border/40 pb-4 mb-8 overflow-x-auto flex-nowrap">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "overview" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <LayoutDashboard size={16} />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "bookings" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Calendar size={16} />
          Booking Queue
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "customers" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Users size={16} />
          Customer Management
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "services" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Database size={16} />
          Services Catalog
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
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
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card glowColor="purple" className="p-6">
                <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-secondary" />
                  Monthly Revenue Trend (SaaS Analytics)
                </h3>
                
                <div className="relative w-full h-[200px] border-b border-l border-border/60 bg-[#111827]/40 rounded p-4 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
                    
                    <path
                      d="M 10 150 L 10 130 Q 90 90 130 110 T 250 50 T 390 30 L 390 150 Z"
                      fill="url(#gradient-area)"
                    />
                    
                    <path
                      d="M 10 130 Q 90 90 130 110 T 250 50 T 390 30"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3.5"
                    />

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
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-start gap-2" onClick={() => setActiveTab("customers")}>
                    <Users size={14} className="text-secondary" />
                    Manage Customers ({customersData?.length || 0})
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
        <div className="space-y-6 font-body">
          {/* Controls Panel: Search & Filters */}
          <Card glowColor="none" className="p-6">
            <div className="flex items-center gap-2 text-sm font-bold font-display text-text uppercase tracking-wider mb-4 border-b border-border/30 pb-2.5">
              <SlidersHorizontal size={16} className="text-secondary" />
              Service Queue Filters & Search
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search Ticket, Client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
              </div>

              <div>
                <select
                  className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none focus:border-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Workflow States</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <select
                  className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none focus:border-primary"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priority Levels</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <select
                  className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none focus:border-primary"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Service Classes</option>
                  <option value="remote">Remote support</option>
                  <option value="onsite">On-Site dispatch</option>
                  <option value="emergency">Emergency SLA</option>
                  <option value="amc">Corporate AMC</option>
                </select>
              </div>
            </div>

            {paginatedBookings.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 border-t border-border/25 pt-4">
                <button 
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors cursor-pointer"
                >
                  {selectedBookingIds.length === paginatedBookings.length && paginatedBookings.length > 0 ? (
                    <CheckSquare size={16} className="text-secondary" />
                  ) : (
                    <Square size={16} />
                  )}
                  Select All on Page ({selectedBookingIds.length} selected)
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    className="bg-[#111827]/60 border border-border text-xs text-text rounded p-1.5 outline-none"
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value)}
                  >
                    <option value="">-- Choose Bulk Action --</option>
                    <option value="complete">Mark Selected Completed</option>
                    <option value="cancel">Mark Selected Cancelled</option>
                    <option value="assign-elena">Assign to Elena Vance</option>
                    <option value="assign-john">Assign to John Freeman</option>
                  </select>
                  <Button 
                    variant="cyber" 
                    size="sm" 
                    className="py-1 px-3 text-xs" 
                    onClick={handleApplyBulkAction}
                    disabled={selectedBookingIds.length === 0 || !bulkActionType}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Bookings Queue Grid */}
          {bookingsLoading ? (
            <div>Loading booking registers...</div>
          ) : paginatedBookings.length === 0 ? (
            <Card className="text-center py-12 text-muted">No matching bookings found.</Card>
          ) : (
            <div className="flex flex-col gap-4">
              {paginatedBookings.map((b: any) => {
                const isSelected = selectedBookingIds.includes(b.id);
                return (
                  <Card key={b.id} glowColor="none" className={`p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative transition-all ${isSelected ? "border-secondary/40 bg-secondary/5" : ""}`}>
                    <div className="absolute top-5 left-5 md:static shrink-0 cursor-pointer text-muted hover:text-text" onClick={() => handleToggleSelectOne(b.id)}>
                      {isSelected ? (
                        <CheckSquare size={18} className="text-secondary" />
                      ) : (
                        <Square size={18} />
                      )}
                    </div>

                    <div className="font-body text-xs space-y-1 pl-7 md:pl-0 flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          {b.ticketId || "INCIDENT"}
                        </span>
                        <span className="font-display font-bold text-sm text-text">{b.name}</span>
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
                      
                      {(b.remarks || b.partsUsed) && (
                        <div className="text-[11px] text-primary mt-2 border-t border-border/20 pt-2 flex flex-col gap-0.5">
                          {b.remarks && <div>Remarks: <span className="text-text">{b.remarks}</span></div>}
                          {b.partsUsed && <div>Parts Consumed: <span className="text-text">{b.partsUsed}</span></div>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 w-full md:w-auto pl-7 md:pl-0 mt-2 md:mt-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted font-body">Assign:</span>
                        <select
                          className="bg-[#111827]/60 border border-border text-[11px] text-text font-semibold rounded p-1 outline-none"
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
                            <Button variant="ghost" size="sm" className="text-[11px] py-1 text-success hover:bg-success/15" onClick={() => updateBookingMutation.mutate({ id: b.id, status: "completed" })}>
                              Complete
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[11px] py-1 text-danger hover:bg-danger/15" onClick={() => updateBookingMutation.mutate({ id: b.id, status: "cancelled" })}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-xs text-muted">
              <span>Showing {startIndex + 1} - {endIndex} of {totalItems} incidents</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-2 h-8"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="font-semibold text-text">Page {currentPage} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-2 h-8"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMER MANAGEMENT TAB (CRM) */}
      {activeTab === "customers" && (
        <div className="space-y-6 font-body">
          {/* Controls: Search, Filters & Export */}
          <Card glowColor="none" className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-border/30 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold font-display text-text uppercase tracking-wider">
                <Users size={16} className="text-secondary" />
                Customer CRM Registers
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => { clearCustForm(); setCustModalOpen(true); }}>
                  <Plus size={14} />
                  Add Customer Profile
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs" onClick={handleExportCSV}>
                  <Download size={14} />
                  Export CRM (CSV)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search Name, Email, Company..."
                  value={custSearchTerm}
                  onChange={(e) => setCustSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
              </div>

              <div>
                <select
                  className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none focus:border-primary"
                  value={custTypeFilter}
                  onChange={(e) => setCustTypeFilter(e.target.value)}
                >
                  <option value="all">All Customer Types</option>
                  <option value="registered">Registered Members</option>
                  <option value="guest">Guest Customers</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer List Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider">Profiles List</h3>
              
              {customersLoading ? (
                <div>Loading CRM databases...</div>
              ) : filteredCustomers.length === 0 ? (
                <Card className="text-center py-8 text-muted">No customers found.</Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredCustomers.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                        selectedCustomerId === c.id
                          ? "bg-secondary/15 border-secondary text-text shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-text truncate max-w-[130px] block">{c.fullName}</span>
                        <Badge variant={c.isGuest ? "muted" : "info"} className="py-0 text-[8px] uppercase">
                          {c.isGuest ? "Guest" : "Member"}
                        </Badge>
                      </div>
                      <p className="truncate text-muted">{c.email}</p>
                      <div className="flex justify-between items-center mt-2.5 border-t border-border/20 pt-2 text-[10px]">
                        <span>Bookings: <strong className="text-text">{c.bookingCount}</strong></span>
                        <span className="text-success font-semibold">{formatCurrency(c.totalSpent)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Profile Inspection Panel */}
            <div className="lg:col-span-2">
              {selectedCustomer ? (
                <div className="flex flex-col gap-6">
                  {/* Info Card */}
                  <Card>
                    <div className="flex justify-between items-start border-b border-border/40 pb-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold font-display text-text">{selectedCustomer.fullName}</h3>
                        <p className="text-xs text-muted mt-1">Customer UUID: {selectedCustomer.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="p-2 h-8 text-secondary" onClick={() => handleOpenEditCustomer(selectedCustomer)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`p-2 h-8 ${selectedCustomer.userStatus === "suspended" ? "text-success hover:bg-success/10" : "text-danger hover:bg-danger/10"}`}
                          onClick={() => toggleCustomerSuspensionMutation.mutate(selectedCustomer.id)}
                          isLoading={toggleCustomerSuspensionMutation.isPending}
                        >
                          {selectedCustomer.userStatus === "suspended" ? <Unlock size={14} /> : <Lock size={14} />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted">
                      <div>
                        <span className="text-muted block">Email Address:</span>
                        <span className="text-text font-semibold">{selectedCustomer.email}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Phone Number:</span>
                        <span className="text-text font-semibold">{selectedCustomer.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Company Name:</span>
                        <span className="text-text font-semibold">{selectedCustomer.companyName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Billing / Dispatch Address:</span>
                        <span className="text-text font-semibold">{selectedCustomer.billingAddress || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted block">Account Status:</span>
                        <Badge variant={selectedCustomer.userStatus === "suspended" ? "danger" : selectedCustomer.userStatus === "pending" ? "warning" : "success"}>
                          {selectedCustomer.userStatus}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Booking history */}
                  <Card>
                    <h4 className="text-sm font-bold font-display text-text uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <History size={16} className="text-secondary" />
                      Client Repair Dispatch History ({selectedCustomer.bookings.length})
                    </h4>
                    {selectedCustomer.bookings.length === 0 ? (
                      <p className="text-xs text-muted italic">No dispatches logged for this customer.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedCustomer.bookings.map((b: any) => (
                          <div key={b.id} className="bg-[#111827]/40 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-mono text-primary font-bold">{b.ticketId || "GUEST"}</span>
                              <span className="text-text font-semibold block mt-0.5 truncate max-w-sm">{b.problemDescription}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted text-[10px]">{b.preferredDate}</span>
                              <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="py-0.5">
                                {b.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Invoices list */}
                  <Card>
                    <h4 className="text-sm font-bold font-display text-text uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <FileText size={16} className="text-secondary" />
                      Client Invoices list ({selectedCustomer.invoices.length})
                    </h4>
                    {selectedCustomer.invoices.length === 0 ? (
                      <p className="text-xs text-muted italic">No invoices compiled for this customer.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedCustomer.invoices.map((inv: any) => (
                          <div key={inv.id} className="bg-[#111827]/40 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-primary font-bold">INV: {inv.invoiceNumber}</span>
                              <div className="text-text font-bold mt-0.5">{formatCurrency(parseFloat(inv.amount))}</div>
                            </div>
                            <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                              {inv.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <Card className="text-center py-20 text-muted">
                  Select a customer profile from the sidebar to inspect dispatch records, billing invoices, and account controls.
                </Card>
              )}
            </div>
          </div>
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

      {/* CREATE / EDIT CUSTOMER MODAL */}
      <Modal isOpen={custModalOpen} onClose={() => setCustModalOpen(false)} title={editingCustomerId ? "Edit Customer Profile" : "Create Customer Profile"}>
        <form onSubmit={handleCustomerSubmit} className="flex flex-col gap-4 font-body">
          <Input
            label="Full Name *"
            placeholder="e.g. Walter White"
            value={custFormName}
            onChange={(e) => setCustFormName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. walter@blue.com"
            value={custFormEmail}
            onChange={(e) => setCustFormEmail(e.target.value)}
            required
          />

          <Input
            label="Mobile Phone *"
            placeholder="e.g. 505-127-1984"
            value={custFormPhone}
            onChange={(e) => setCustFormPhone(e.target.value)}
            required
          />

          <Input
            label="Company Name"
            placeholder="e.g. Gray Matter Technologies"
            value={custFormCompanyName}
            onChange={(e) => setCustFormCompanyName(e.target.value)}
          />

          <Input
            label="Billing / Dispatch Address"
            placeholder="e.g. 308 Negra Arroyo Lane, Albuquerque"
            value={custFormBillingAddress}
            onChange={(e) => setCustFormBillingAddress(e.target.value)}
          />

          <Select
            label="Account Status"
            options={[
              { label: "Active Registered Customer", value: "active" },
              { label: "Suspended Account", value: "suspended" },
              { label: "Pending Guest Account", value: "pending" },
            ]}
            value={custFormStatus}
            onChange={(e: any) => setCustFormStatus(e.target.value)}
          />

          <Button variant="primary" type="submit" isLoading={createCustomerMutation.isPending || updateCustomerMutation.isPending} className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            {editingCustomerId ? "Save Profile Changes" : "Create Profile"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
