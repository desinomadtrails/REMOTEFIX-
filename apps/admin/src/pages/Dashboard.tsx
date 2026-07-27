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
  History,
  Wrench,
  Activity,
  Award,
  Package,
  ShoppingCart,
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
  Printer,
  Percent
} from "lucide-react";
import { Button, Card, Badge, Modal, Input, GlowDivider, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "services" | "logs" | "customers" | "technicians" | "inventory" | "billing">("overview");
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
  const [custTypeFilter, setCustTypeFilter] = useState("all");
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

  // Technician Management States
  const [techSearchTerm, setTechSearchTerm] = useState("");
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);

  // Technician CRUD Dialog States
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [editingEngineerId, setEditingEngineerId] = useState<string | null>(null);
  const [techFormName, setTechFormName] = useState("");
  const [techFormEmail, setTechFormEmail] = useState("");
  const [techFormPhone, setTechFormPhone] = useState("");
  const [techFormBio, setTechFormBio] = useState("");
  const [techFormSpecialities, setTechFormSpecialities] = useState("");
  const [techFormStatus, setTechFormStatus] = useState("available");
  const [techFormUserStatus, setTechFormUserStatus] = useState("active");

  // Inventory States (LocalStorage)
  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem("rf_inv_products");
    if (saved) return JSON.parse(saved);
    return [
      { sku: "SSD-1TB", name: "Crucial 1TB NVMe SSD", category: "Storage", stock: 4, threshold: 5, unitCost: 85.00 },
      { sku: "CAT6-100", name: "Cat6 Ethernet Cable 100m", category: "Networking", stock: 12, threshold: 5, unitCost: 45.00 },
      { sku: "SW-8P", name: "Netgear 8-Port Gigabit Switch", category: "Networking", stock: 2, threshold: 3, unitCost: 35.00 },
      { sku: "RJ45-100", name: "RJ45 Connectors (Pack of 100)", category: "Accessories", stock: 25, threshold: 10, unitCost: 15.00 }
    ];
  });

  const [suppliers, setSuppliers] = useState<any[]>(() => {
    const saved = localStorage.getItem("rf_inv_suppliers");
    if (saved) return JSON.parse(saved);
    return [
      { id: "sup-1", name: "StarTech Distribution", contact: "sales@startech.com", phone: "800-265-1844" },
      { id: "sup-2", name: "Cisco Systems Direct", contact: "orders@cisco.com", phone: "800-553-6387" },
      { id: "sup-3", name: "Prime IT Wholesale", contact: "info@primeit.com", phone: "555-019-2830" }
    ];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("rf_inv_pos");
    if (saved) return JSON.parse(saved);
    return [
      { id: "PO-20260727-001", sku: "SSD-1TB", qty: 10, supplier: "StarTech Distribution", status: "ordered", createdAt: "2026-07-27" }
    ];
  });

  const [materialIssues, setMaterialIssues] = useState<any[]>(() => {
    const saved = localStorage.getItem("rf_inv_issues");
    if (saved) return JSON.parse(saved);
    return [
      { id: "ISS-001", ticketId: "RF-100247", sku: "CAT6-100", qty: 1, createdAt: "2026-07-27" }
    ];
  });

  // Sync inventory states to LocalStorage
  useEffect(() => {
    localStorage.setItem("rf_inv_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("rf_inv_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("rf_inv_pos", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("rf_inv_issues", JSON.stringify(materialIssues));
  }, [materialIssues]);

  // Inventory Search and Modals
  const [invSearchTerm, setInvSearchTerm] = useState("");
  const [inventorySubTab, setInventorySubTab] = useState<"products" | "suppliers" | "pos" | "issues">("products");
  
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [newPoOpen, setNewPoOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  // Form States for Inventory
  const [prodFormSku, setProdFormSku] = useState("");
  const [prodFormName, setProdFormName] = useState("");
  const [prodFormCategory, setProdFormCategory] = useState("Storage");
  const [prodFormStock, setProdFormStock] = useState("");
  const [prodFormThreshold, setProdFormThreshold] = useState("");
  const [prodFormUnitCost, setProdFormUnitCost] = useState("");

  const [supFormName, setSupFormName] = useState("");
  const [supFormContact, setSupFormContact] = useState("");
  const [supFormPhone, setSupFormPhone] = useState("");

  const [poFormSku, setPoFormSku] = useState("");
  const [poFormQty, setPoFormQty] = useState("");
  const [poFormSupplier, setPoFormSupplier] = useState("");

  const [issueFormTicketId, setIssueFormTicketId] = useState("");
  const [issueFormSku, setIssueFormSku] = useState("");
  const [issueFormQty, setIssueFormQty] = useState("");

  // Billing Module States
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingStatusFilter, setBillingStatusFilter] = useState("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);

  // Form States for Billing
  const [invFormBookingId, setInvFormBookingId] = useState("");
  const [invFormAmount, setInvFormAmount] = useState("");

  // Default dropdown setups
  useEffect(() => {
    if (products.length > 0) {
      setPoFormSku(products[0].sku);
      setIssueFormSku(products[0].sku);
    }
    if (suppliers.length > 0) {
      setPoFormSupplier(suppliers[0].name);
    }
  }, [products, suppliers]);

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

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
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

  const { data: engineersData, isLoading: engineersLoading } = useQuery({
    queryKey: ["admin-engineers"],
    queryFn: async () => {
      const res = await api.getEngineers();
      return res.engineers || [];
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
      queryClient.invalidateQueries({ queryKey: ["admin-engineers"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-engineers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setTimeout(() => setSeedingSuccess(false), 3000);
    },
  });

  // Customer Mutations
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

  // Technician Mutations
  const createEngineerMutation = useMutation({
    mutationFn: (payload: any) => api.createEngineer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-engineers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      setTechModalOpen(false);
      clearTechForm();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to create technician.");
    }
  });

  const updateEngineerMutation = useMutation({
    mutationFn: (payload: { id: string; body: any }) => api.updateEngineer(payload.id, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-engineers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      setTechModalOpen(false);
      clearTechForm();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update technician.");
    }
  });

  const toggleEngineerSuspensionMutation = useMutation({
    mutationFn: (id: string) => api.deleteEngineer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-engineers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to toggle status.");
    }
  });

  // Invoices & Billing Mutations
  const generateInvoiceMutation = useMutation({
    mutationFn: (payload: any) => api.createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setNewInvoiceModalOpen(false);
      setInvFormBookingId("");
      setInvFormAmount("");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to generate invoice.");
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) => api.updateInvoice(payload.id, { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["admin-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update status.");
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

  const clearTechForm = () => {
    setEditingEngineerId(null);
    setTechFormName("");
    setTechFormEmail("");
    setTechFormPhone("");
    setTechFormBio("");
    setTechFormSpecialities("");
    setTechFormStatus("available");
    setTechFormUserStatus("active");
  };

  const handleOpenEditEngineer = (eng: any) => {
    setEditingEngineerId(eng.id);
    setTechFormName(eng.fullName);
    setTechFormEmail(eng.email);
    setTechFormPhone(eng.phone);
    setTechFormBio(eng.bio || "");
    setTechFormSpecialities(eng.specialities || "");
    setTechFormStatus(eng.status);
    setTechFormUserStatus(eng.userStatus);
    setTechModalOpen(true);
  };

  const handleEngineerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techFormName || !techFormEmail || !techFormPhone) return;

    const payload = {
      fullName: techFormName,
      email: techFormEmail,
      phone: techFormPhone,
      bio: techFormBio || null,
      specialities: techFormSpecialities || null,
      status: techFormStatus,
      userStatus: techFormUserStatus,
    };

    if (editingEngineerId) {
      updateEngineerMutation.mutate({ id: editingEngineerId, body: payload });
    } else {
      createEngineerMutation.mutate(payload);
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

  // Inventory logic handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormSku || !prodFormName || !prodFormStock) return;
    
    if (products.some(p => p.sku.toLowerCase() === prodFormSku.toLowerCase())) {
      alert("A product with this SKU code already exists!");
      return;
    }

    const newProd = {
      sku: prodFormSku.toUpperCase(),
      name: prodFormName,
      category: prodFormCategory,
      stock: parseInt(prodFormStock),
      threshold: parseInt(prodFormThreshold || "5"),
      unitCost: parseFloat(prodFormUnitCost || "0.00")
    };

    setProducts([...products, newProd]);
    setNewProductOpen(false);
    
    setProdFormSku("");
    setProdFormName("");
    setProdFormStock("");
    setProdFormThreshold("");
    setProdFormUnitCost("");
  };

  const handleDeleteProduct = (sku: string) => {
    if (window.confirm(`Are you sure you want to remove item SKU: ${sku}?`)) {
      setProducts(products.filter(p => p.sku !== sku));
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supFormName || !supFormContact) return;

    const newSup = {
      id: `sup-${Date.now().toString().slice(-4)}`,
      name: supFormName,
      contact: supFormContact,
      phone: supFormPhone || "N/A"
    };

    setSuppliers([...suppliers, newSup]);
    setNewSupplierOpen(false);
    setSupFormName("");
    setSupFormContact("");
    setSupFormPhone("");
  };

  const handleAddPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poFormSku || !poFormQty || !poFormSupplier) return;

    const newPo = {
      id: `PO-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      sku: poFormSku,
      qty: parseInt(poFormQty),
      supplier: poFormSupplier,
      status: "ordered",
      createdAt: new Date().toISOString().split("T")[0]
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setNewPoOpen(false);
    setPoFormQty("");
  };

  const handleGoodsReceipt = (poId: string) => {
    const po = purchaseOrders.find(o => o.id === poId);
    if (!po || po.status === "received") return;

    setPurchaseOrders(purchaseOrders.map(o => o.id === poId ? { ...o, status: "received" } : o));
    setProducts(products.map(p => p.sku === po.sku ? { ...p, stock: p.stock + po.qty } : p));
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueFormTicketId || !issueFormSku || !issueFormQty) return;
    const issueQty = parseInt(issueFormQty);

    const targetProduct = products.find(p => p.sku === issueFormSku);
    if (!targetProduct) return;

    if (targetProduct.stock < issueQty) {
      alert(`Insufficient stock! SKU ${issueFormSku} currently has only ${targetProduct.stock} units available.`);
      return;
    }

    const newIssue = {
      id: `ISS-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      ticketId: issueFormTicketId,
      sku: issueFormSku,
      qty: issueQty,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setProducts(products.map(p => p.sku === issueFormSku ? { ...p, stock: p.stock - issueQty } : p));
    setMaterialIssues([newIssue, ...materialIssues]);
    setNewIssueOpen(false);
    setIssueFormTicketId("");
    setIssueFormQty("");
  };

  // Billing submit handler
  const handleGenerateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invFormBookingId || !invFormAmount) return;

    generateInvoiceMutation.mutate({
      bookingId: invFormBookingId,
      amount: parseFloat(invFormAmount)
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

  // Technician List Search logic
  const filteredEngineers = (engineersData || []).filter((eng: any) => {
    const searchLower = techSearchTerm.toLowerCase();
    return (
      eng.fullName.toLowerCase().includes(searchLower) ||
      eng.email.toLowerCase().includes(searchLower) ||
      eng.phone.includes(searchLower) ||
      (eng.specialities || "").toLowerCase().includes(searchLower)
    );
  });

  const selectedEngineer = (engineersData || []).find((eng: any) => eng.id === selectedEngineerId);

  // Inventory Search & Valuation
  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const totalInventoryAssetValue = products.reduce((sum, p) => sum + (p.stock * p.unitCost), 0);

  const filteredInventoryProducts = products.filter(p => {
    const searchLower = invSearchTerm.toLowerCase();
    return (
      p.sku.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  });

  // Billing Module logic
  const filteredInvoices = (invoicesData || []).filter((inv: any) => {
    const searchLower = billingSearchTerm.toLowerCase();
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchLower) ||
      inv.bookingId.toLowerCase().includes(searchLower);

    const matchesStatus = billingStatusFilter === "all" || inv.status === billingStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedInvoice = (invoicesData || []).find((inv: any) => inv.id === selectedInvoiceId);
  const selectedInvoiceBooking = selectedInvoice 
    ? (bookingsData || []).find((b: any) => b.id === selectedInvoice.bookingId)
    : null;

  // Invoices reports
  const totalCollectedRevenue = (invoicesData || [])
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0);

  const totalOutstandingDues = (invoicesData || [])
    .filter((inv: any) => inv.status === "unpaid")
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0);

  // Dynamic GST calculation (flat 18% GST: 9% CGST + 9% SGST)
  const gstRate = 0.18;
  const totalGstCollected = (invoicesData || [])
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => {
      const baseAmount = parseFloat(inv.amount) / (1 + gstRate);
      return sum + (parseFloat(inv.amount) - baseAmount);
    }, 0);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 mb-8 font-body">
        <div>
          <h1 className="text-3xl font-black font-display text-text">Administrative Suite</h1>
          <span className="text-xs text-muted mt-0.5">Control Center Mode: <span className="text-success font-semibold">Active</span></span>
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
          onClick={() => setActiveTab("technicians")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "technicians" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Wrench size={16} />
          Technicians
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "inventory" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Package size={16} />
          Inventory Control
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all shrink-0 ${
            activeTab === "billing" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Receipt size={16} />
          Billing &amp; Invoices
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
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-start gap-2" onClick={() => setActiveTab("billing")}>
                    <Receipt size={14} className="text-secondary" />
                    Audit Invoices ({invoicesData?.length || 0})
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

            <div className="lg:col-span-2">
              {selectedCustomer ? (
                <div className="flex flex-col gap-6">
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

      {/* TECHNICIAN MANAGEMENT TAB (CRM) */}
      {activeTab === "technicians" && (
        <div className="space-y-6 font-body">
          <Card glowColor="none" className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-border/30 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold font-display text-text uppercase tracking-wider">
                <Wrench size={16} className="text-secondary" />
                Technician Registry & Scheduling
              </div>
              <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs w-full md:w-auto" onClick={() => { clearTechForm(); setTechModalOpen(true); }}>
                <Plus size={14} />
                Register New Technician
              </Button>
            </div>

            <div className="relative">
              <Input
                placeholder="Search Name, Email, Skills (e.g. Cisco)..."
                value={techSearchTerm}
                onChange={(e) => setTechSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider">Staff Roster</h3>
              
              {engineersLoading ? (
                <div>Loading technician logs...</div>
              ) : filteredEngineers.length === 0 ? (
                <Card className="text-center py-8 text-muted">No technicians found.</Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredEngineers.map((eng: any) => (
                    <div
                      key={eng.id}
                      onClick={() => setSelectedEngineerId(eng.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                        selectedEngineerId === eng.id
                          ? "bg-secondary/15 border-secondary text-text shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-text truncate max-w-[130px] block">{eng.fullName}</span>
                        <Badge 
                          variant={
                            eng.status === "available"
                              ? "success"
                              : eng.status === "busy"
                              ? "warning"
                              : "danger"
                          }
                          className="py-0 text-[8px] uppercase"
                        >
                          {eng.status}
                        </Badge>
                      </div>
                      <p className="truncate text-muted">{eng.email}</p>
                      
                      {eng.specialities && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {eng.specialitiesList.slice(0, 2).map((s: string, idx: number) => (
                            <span key={idx} className="bg-primary/10 border border-primary/20 text-primary text-[8px] px-1 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedEngineer ? (
                <div className="flex flex-col gap-6">
                  <Card>
                    <div className="flex justify-between items-start border-b border-border/40 pb-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold font-display text-text">{selectedEngineer.fullName}</h3>
                        <p className="text-xs text-muted mt-1">Specialist Ref: {selectedEngineer.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="p-2 h-8 text-secondary" onClick={() => handleOpenEditEngineer(selectedEngineer)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`p-2 h-8 ${selectedEngineer.userStatus === "suspended" ? "text-success hover:bg-success/10" : "text-danger hover:bg-danger/10"}`}
                          onClick={() => toggleEngineerSuspensionMutation.mutate(selectedEngineer.id)}
                          isLoading={toggleEngineerSuspensionMutation.isPending}
                        >
                          {selectedEngineer.userStatus === "suspended" ? <Unlock size={14} /> : <Lock size={14} />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted block">Availability:</span>
                          <Badge variant={selectedEngineer.status === "available" ? "success" : selectedEngineer.status === "busy" ? "warning" : "danger"}>
                            {selectedEngineer.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted block">Phone Number:</span>
                          <span className="text-text font-semibold">{selectedEngineer.phone}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Email:</span>
                          <span className="text-text font-semibold">{selectedEngineer.email}</span>
                        </div>
                        {selectedEngineer.bio && (
                          <div>
                            <span className="text-muted block">Bio:</span>
                            <span className="text-text leading-relaxed">{selectedEngineer.bio}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-muted block flex items-center gap-1">
                            <Award size={12} className="text-primary" />
                            Skills &amp; Specialties:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {selectedEngineer.specialitiesList.length === 0 ? (
                              <span className="text-muted italic text-[10px]">No skills logged.</span>
                            ) : (
                              selectedEngineer.specialitiesList.map((s: string, idx: number) => (
                                <span key={idx} className="bg-primary/10 border border-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded font-semibold">
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted block">Account Status:</span>
                          <Badge variant={selectedEngineer.userStatus === "suspended" ? "danger" : "success"}>
                            {selectedEngineer.userStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card glowColor="purple" className="p-4 flex items-center gap-3">
                      <Activity size={24} className="text-secondary shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted uppercase font-semibold">Success Rate</span>
                        <div className="text-lg font-black text-text mt-0.5 font-display">{selectedEngineer.successRate}%</div>
                      </div>
                    </Card>
                    <Card glowColor="purple" className="p-4 flex items-center gap-3">
                      <CheckCircle size={24} className="text-secondary shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted uppercase font-semibold">Repairs Completed</span>
                        <div className="text-lg font-black text-text mt-0.5 font-display">{selectedEngineer.completedCount}</div>
                      </div>
                    </Card>
                    <Card glowColor="purple" className="p-4 flex items-center gap-3">
                      <DollarSign size={24} className="text-secondary shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted uppercase font-semibold">Revenue Generated</span>
                        <div className="text-lg font-black text-text mt-0.5 font-display">{formatCurrency(selectedEngineer.totalRevenueGenerated)}</div>
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <h4 className="text-sm font-bold font-display text-text uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <ClipboardList size={16} className="text-secondary" />
                      Assigned Incidents Timeline ({selectedEngineer.bookings.length})
                    </h4>
                    {selectedEngineer.bookings.length === 0 ? (
                      <p className="text-xs text-muted italic">No incidents assigned to this technician.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedEngineer.bookings.map((b: any) => (
                          <div key={b.id} className="bg-[#111827]/40 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-mono text-primary font-bold">{b.ticketId || "INCIDENT"}</span>
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
                </div>
              ) : (
                <Card className="text-center py-20 text-muted">
                  Select a technician from the roster list to audit diagnostic performance metrics, active schedules, and skills logs.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY CONTROL TAB */}
      {activeTab === "inventory" && (
        <div className="space-y-6 font-body">
          {lowStockProducts.length > 0 && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-bold font-display block">Critical Low Stock Warning!</span>
                <span className="text-xs mt-1 block">
                  The following items have fallen below safety inventory levels:{" "}
                  <strong className="text-text">
                    {lowStockProducts.map(p => `${p.sku} (${p.stock} left)`).join(", ")}
                  </strong>
                  . Please compile Purchase Orders.
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Inventory Value</span>
                <div className="text-2xl font-black font-display text-text mt-1">
                  {formatCurrency(totalInventoryAssetValue)}
                </div>
              </div>
              <DollarSign className="text-secondary w-8 h-8 opacity-70" />
            </Card>

            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Safety Alerts</span>
                <div className="text-2xl font-black font-display text-text mt-1 text-danger">
                  {lowStockProducts.length} SKU{lowStockProducts.length !== 1 ? "s" : ""} Low
                </div>
              </div>
              <AlertTriangle className="text-danger w-8 h-8 opacity-70" />
            </Card>

            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Registered Products</span>
                <div className="text-2xl font-black font-display text-text mt-1">
                  {products.length} Items
                </div>
              </div>
              <Package className="text-secondary w-8 h-8 opacity-70" />
            </Card>
          </div>

          <div className="flex gap-4 border-b border-border/25 pb-3">
            <button
              onClick={() => setInventorySubTab("products")}
              className={`text-xs font-bold font-display pb-1 border-b-2 cursor-pointer transition-all ${
                inventorySubTab === "products" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
              }`}
            >
              Stock Sheets
            </button>
            <button
              onClick={() => setInventorySubTab("suppliers")}
              className={`text-xs font-bold font-display pb-1 border-b-2 cursor-pointer transition-all ${
                inventorySubTab === "suppliers" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
              }`}
            >
              Suppliers Registry
            </button>
            <button
              onClick={() => setInventorySubTab("pos")}
              className={`text-xs font-bold font-display pb-1 border-b-2 cursor-pointer transition-all ${
                inventorySubTab === "pos" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setInventorySubTab("issues")}
              className={`text-xs font-bold font-display pb-1 border-b-2 cursor-pointer transition-all ${
                inventorySubTab === "issues" ? "border-secondary text-secondary" : "border-transparent text-muted hover:text-text"
              }`}
            >
              Material Dispatches
            </button>
          </div>

          {inventorySubTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Input
                    placeholder="Search SKU or Product Name..."
                    value={invSearchTerm}
                    onChange={(e) => setInvSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
                </div>
                <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs w-full sm:w-auto" onClick={() => setNewProductOpen(true)}>
                  <Plus size={14} />
                  Add SKU Product
                </Button>
              </div>

              <Card glowColor="none" className="p-4 overflow-x-auto">
                <table className="w-full text-xs text-left text-muted border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-text font-semibold uppercase font-display">
                      <th className="pb-3 pr-4">SKU</th>
                      <th className="pb-3 pr-4">Product Name</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4 text-right">Stock Level</th>
                      <th className="pb-3 pr-4 text-right">Safety Limit</th>
                      <th className="pb-3 pr-4 text-right">Unit Cost</th>
                      <th className="pb-3 pr-4 text-right">Asset Value</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventoryProducts.map((p) => {
                      const isLow = p.stock <= p.threshold;
                      return (
                        <tr key={p.sku} className="border-b border-border/30 hover:bg-[#111827]/30 transition-colors">
                          <td className="py-3 pr-4 font-mono font-bold text-primary">{p.sku}</td>
                          <td className="py-3 pr-4 text-text font-semibold">{p.name}</td>
                          <td className="py-3 pr-4">{p.category}</td>
                          <td className={`py-3 pr-4 text-right font-bold ${isLow ? "text-danger" : "text-text"}`}>
                            {p.stock}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono">{p.threshold}</td>
                          <td className="py-3 pr-4 text-right">{formatCurrency(p.unitCost)}</td>
                          <td className="py-3 pr-4 text-right text-text font-bold">
                            {formatCurrency(p.stock * p.unitCost)}
                          </td>
                          <td className="py-3 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] text-danger hover:bg-danger/10 py-1"
                              onClick={() => handleDeleteProduct(p.sku)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {inventorySubTab === "suppliers" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-display text-text uppercase">Suppliers Registry</h3>
                <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setNewSupplierOpen(true)}>
                  <Plus size={14} />
                  Add Supplier
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suppliers.map(s => (
                  <Card key={s.id} glowColor="none" className="p-4 flex flex-col gap-2 text-xs">
                    <h4 className="text-sm font-bold text-text font-display">{s.name}</h4>
                    <div>Email: <span className="text-text font-semibold">{s.contact}</span></div>
                    <div>Phone: <span className="text-text font-semibold">{s.phone}</span></div>
                    <span className="text-muted block mt-2 text-[10px] font-mono">SUP-ID: {s.id}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {inventorySubTab === "pos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-display text-text uppercase">Purchase Orders (Refills)</h3>
                <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setNewPoOpen(true)}>
                  <Plus size={14} />
                  Compile Purchase Order
                </Button>
              </div>

              <Card glowColor="none" className="p-4 overflow-x-auto">
                <table className="w-full text-xs text-left text-muted border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-text font-semibold uppercase font-display">
                      <th className="pb-3 pr-4">PO Code</th>
                      <th className="pb-3 pr-4">SKU Product</th>
                      <th className="pb-3 pr-4 text-right">Quantity</th>
                      <th className="pb-3 pr-4">Supplier</th>
                      <th className="pb-3 pr-4">Created Date</th>
                      <th className="pb-3 pr-4">Workflow Status</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="border-b border-border/30 hover:bg-[#111827]/30 transition-colors">
                        <td className="py-3 pr-4 font-mono font-bold text-primary">{po.id}</td>
                        <td className="py-3 pr-4 text-text font-semibold">{po.sku}</td>
                        <td className="py-3 pr-4 text-right font-bold text-text">{po.qty}</td>
                        <td className="py-3 pr-4">{po.supplier}</td>
                        <td className="py-3 pr-4 font-mono">{po.createdAt}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={po.status === "received" ? "success" : "warning"}>
                            {po.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          {po.status === "ordered" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] text-success hover:bg-success/15 py-1 px-3"
                              onClick={() => handleGoodsReceipt(po.id)}
                            >
                              Goods Receipt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {inventorySubTab === "issues" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold font-display text-text uppercase">Material Issue logs</h3>
                <Button variant="cyber" size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setNewIssueOpen(true)}>
                  <Plus size={14} />
                  Issue Parts to Booking
                </Button>
              </div>

              <Card glowColor="none" className="p-4 overflow-x-auto">
                <table className="w-full text-xs text-left text-muted border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-text font-semibold uppercase font-display">
                      <th className="pb-3 pr-4">Issue Code</th>
                      <th className="pb-3 pr-4">Ticket / Booking ID</th>
                      <th className="pb-3 pr-4">SKU Product</th>
                      <th className="pb-3 pr-4 text-right">Quantity issued</th>
                      <th className="pb-3">Issued Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialIssues.map((issue) => (
                      <tr key={issue.id} className="border-b border-border/30 hover:bg-[#111827]/30 transition-colors">
                        <td className="py-3 pr-4 font-mono font-bold text-primary">{issue.id}</td>
                        <td className="py-3 pr-4 font-mono text-text">{issue.ticketId}</td>
                        <td className="py-3 pr-4 text-text font-semibold">{issue.sku}</td>
                        <td className="py-3 pr-4 text-right font-bold text-text">{issue.qty}</td>
                        <td className="py-3 font-mono">{issue.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* BILLING & INVOICES TAB */}
      {activeTab === "billing" && (
        <div className="space-y-6 font-body">
          {/* Billing Reports Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Revenue Collected</span>
                <div className="text-2xl font-black font-display text-text mt-1 text-success">
                  {formatCurrency(totalCollectedRevenue)}
                </div>
              </div>
              <DollarSign className="text-success w-8 h-8 opacity-75" />
            </Card>

            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Outstanding Dues</span>
                <div className="text-2xl font-black font-display text-text mt-1 text-warning">
                  {formatCurrency(totalOutstandingDues)}
                </div>
              </div>
              <AlertCircle className="text-warning w-8 h-8 opacity-75" />
            </Card>

            <Card glowColor="purple" className="flex items-center justify-between p-5">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">GST Tax Collected (18% Flat)</span>
                <div className="text-2xl font-black font-display text-text mt-1 text-primary">
                  {formatCurrency(totalGstCollected)}
                </div>
              </div>
              <Percent className="text-primary w-8 h-8 opacity-75" />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoices List Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/20 pb-3">
                <h3 className="text-sm font-bold font-display text-text uppercase">Invoices Registry</h3>
                <Button variant="cyber" size="sm" className="text-xs" onClick={() => setNewInvoiceModalOpen(true)}>
                  Create Invoice
                </Button>
              </div>

              <div className="relative">
                <Input
                  placeholder="Search Invoice Number..."
                  value={billingSearchTerm}
                  onChange={(e) => setBillingSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
              </div>

              <div>
                <select
                  className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none focus:border-primary"
                  value={billingStatusFilter}
                  onChange={(e) => setBillingStatusFilter(e.target.value)}
                >
                  <option value="all">All Invoice States</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {invoicesLoading ? (
                <div>Loading invoices...</div>
              ) : filteredInvoices.length === 0 ? (
                <Card className="text-center py-8 text-muted">No invoices found.</Card>
              ) : (
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredInvoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                        selectedInvoiceId === inv.id
                          ? "bg-secondary/15 border-secondary text-text shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                          : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-text">{inv.invoiceNumber}</span>
                        <Badge 
                          variant={
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "unpaid"
                              ? "warning"
                              : "danger"
                          }
                          className="py-0 text-[8px] uppercase"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2 border-t border-border/10 pt-2 text-[10px]">
                        <span className="text-muted">{formatDateTime(inv.createdAt).split(" ")[0]}</span>
                        <strong className="text-text">{formatCurrency(parseFloat(inv.amount))}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Inspect Panel */}
            <div className="lg:col-span-2">
              {selectedInvoice ? (
                <div className="flex flex-col gap-6">
                  {/* Controls Card */}
                  <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-body">Mark Status:</span>
                      <select
                        className="bg-[#111827]/60 border border-border text-xs text-text font-bold rounded p-1.5 outline-none"
                        value={selectedInvoice.status}
                        onChange={(e) => updateInvoiceMutation.mutate({ id: selectedInvoice.id, status: e.target.value })}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs text-secondary border border-secondary/20" onClick={() => window.print()}>
                      <Printer size={14} />
                      Print Invoice (PDF)
                    </Button>
                  </Card>

                  {/* Printable Invoice Container */}
                  <div id="printable-invoice" className="bg-[#111827]/60 border border-border/80 rounded-2xl p-8 font-body text-xs text-text flex flex-col gap-6 print:border-none print:bg-white print:text-black">
                    <div className="flex justify-between items-start border-b border-border/30 pb-6 print:border-black/20">
                      <div>
                        <h3 className="text-2xl font-black font-display text-text print:text-black">RemoteFix Inc.</h3>
                        <p className="text-muted mt-1 print:text-black/60">
                          SaaS Enterprise IT Dispatches &amp; Repairs<br />
                          100 Tech Park Drive, Suite A<br />
                          New Delhi, Delhi - 110020
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-primary print:text-black">INVOICE</div>
                        <h4 className="text-lg font-black font-mono text-text mt-1 print:text-black">{selectedInvoice.invoiceNumber}</h4>
                        <div className="text-[10px] text-muted mt-1 print:text-black/60">
                          Issued: {formatDateTime(selectedInvoice.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Client & Booking details */}
                    <div className="grid grid-cols-2 gap-8 border-b border-border/30 pb-6 print:border-black/20">
                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1.5 print:text-black/60">Bill To:</span>
                        {selectedInvoiceBooking ? (
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-text print:text-black">{selectedInvoiceBooking.name}</div>
                            <div className="text-muted print:text-black/75">{selectedInvoiceBooking.email}</div>
                            <div className="text-muted print:text-black/75">Phone: {selectedInvoiceBooking.phone}</div>
                            {selectedInvoiceBooking.address && (
                              <div className="text-muted print:text-black/75 mt-1 leading-relaxed">{selectedInvoiceBooking.address}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted italic print:text-black/60">Guest Client Profile</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1.5 print:text-black/60">Ref Booking:</span>
                        <div className="space-y-0.5">
                          <div>Ticket ID: <strong className="font-mono text-text print:text-black">{selectedInvoiceBooking?.ticketId || "N/A"}</strong></div>
                          <div>Service Class: <span className="text-text print:text-black font-semibold uppercase">{selectedInvoiceBooking?.type || "Standard"}</span></div>
                          <div>Priority: <span className="text-text print:text-black font-semibold uppercase">{selectedInvoiceBooking?.priority || "Normal"}</span></div>
                          {selectedInvoiceBooking?.deviceType && (
                            <div>Device: <span className="text-text print:text-black">{selectedInvoiceBooking.brand} {selectedInvoiceBooking.model} ({selectedInvoiceBooking.deviceType})</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ledger breakdown */}
                    <div className="flex-grow">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/50 font-bold uppercase text-[10px] text-muted print:border-black/20 print:text-black/60">
                            <th className="pb-2">Description</th>
                            <th className="pb-2 text-right">Taxable base</th>
                            <th className="pb-2 text-right">GST (18%)</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/20 text-text font-semibold print:border-black/10 print:text-black">
                            <td className="py-4">
                              <span className="font-bold block text-sm">Hardware Repair &amp; Systems Diagnostics</span>
                              <span className="text-muted text-[10px] block mt-0.5 print:text-black/60">
                                Diagnostics: {selectedInvoiceBooking?.problemDescription || "Platform service dispatches"}
                              </span>
                            </td>
                            <td className="py-4 text-right font-mono">
                              {formatCurrency(parseFloat(selectedInvoice.amount) / (1 + gstRate))}
                            </td>
                            <td className="py-4 text-right font-mono text-primary print:text-black">
                              {formatCurrency(parseFloat(selectedInvoice.amount) - (parseFloat(selectedInvoice.amount) / (1 + gstRate)))}
                            </td>
                            <td className="py-4 text-right font-mono font-bold">
                              {formatCurrency(parseFloat(selectedInvoice.amount))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Totals panel */}
                    <div className="flex justify-end pt-6 border-t border-border/30 print:border-black/20">
                      <div className="w-64 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted print:text-black/60">Taxable Value:</span>
                          <span className="font-mono text-text print:text-black">
                            {formatCurrency(parseFloat(selectedInvoice.amount) / (1 + gstRate))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted print:text-black/60">CGST (9.0%):</span>
                          <span className="font-mono text-text print:text-black">
                            {formatCurrency((parseFloat(selectedInvoice.amount) - (parseFloat(selectedInvoice.amount) / (1 + gstRate))) / 2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted print:text-black/60">SGST (9.0%):</span>
                          <span className="font-mono text-text print:text-black">
                            {formatCurrency((parseFloat(selectedInvoice.amount) - (parseFloat(selectedInvoice.amount) / (1 + gstRate))) / 2)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border/30 pt-2 text-sm font-bold print:border-black/20">
                          <span className="text-text print:text-black">Total Payable:</span>
                          <span className="font-mono text-secondary print:text-black">
                            {formatCurrency(parseFloat(selectedInvoice.amount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="text-center py-20 text-muted">
                  Select an invoice registry record to print GST invoices, check billing totals, and change payment statuses.
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

      {/* CREATE / EDIT TECHNICIAN MODAL */}
      <Modal isOpen={techModalOpen} onClose={() => setTechModalOpen(false)} title={editingEngineerId ? "Edit Technician Profile" : "Register New Technician"}>
        <form onSubmit={handleEngineerSubmit} className="flex flex-col gap-4 font-body">
          <Input
            label="Full Name *"
            placeholder="e.g. Gordon Freeman"
            value={techFormName}
            onChange={(e) => setTechFormName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. gordon@blackmesa.com"
            value={techFormEmail}
            onChange={(e) => setTechFormEmail(e.target.value)}
            required
          />

          <Input
            label="Mobile Phone *"
            placeholder="e.g. 505-888-2920"
            value={techFormPhone}
            onChange={(e) => setTechFormPhone(e.target.value)}
            required
          />

          <Input
            label="Specialities / Skills (Comma-separated) *"
            placeholder="e.g. Cisco, WiFi Audit, Malware Response"
            value={techFormSpecialities}
            onChange={(e) => setTechFormSpecialities(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display text-muted">Technician Biography</label>
            <textarea
              rows={3}
              placeholder="e.g. PhD in Theoretical Physics from MIT, 10 years network diagnostics..."
              value={techFormBio}
              onChange={(e) => setTechFormBio(e.target.value)}
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Availability Status"
              options={[
                { label: "Available", value: "available" },
                { label: "Busy (Active Dispatch)", value: "busy" },
                { label: "Offline (Leave / Shift ended)", value: "offline" },
              ]}
              value={techFormStatus}
              onChange={(e: any) => setTechFormStatus(e.target.value)}
            />

            <Select
              label="Account Access"
              options={[
                { label: "Active", value: "active" },
                { label: "Suspended", value: "suspended" },
              ]}
              value={techFormUserStatus}
              onChange={(e: any) => setTechFormUserStatus(e.target.value)}
            />
          </div>

          <Button variant="primary" type="submit" isLoading={createEngineerMutation.isPending || updateEngineerMutation.isPending} className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            {editingEngineerId ? "Save Technician Changes" : "Register Technician"}
          </Button>
        </form>
      </Modal>

      {/* CREATE NEW PRODUCT SKU MODAL */}
      <Modal isOpen={newProductOpen} onClose={() => setNewProductOpen(false)} title="Create New Product SKU">
        <form onSubmit={handleAddProduct} className="flex flex-col gap-4 font-body">
          <Input
            label="SKU Code (Unique ID) *"
            placeholder="e.g. CAT6-100"
            value={prodFormSku}
            onChange={(e) => setProdFormSku(e.target.value)}
            required
          />
          <Input
            label="Product Name *"
            placeholder="e.g. Cat6 Ethernet Cable 100m spool"
            value={prodFormName}
            onChange={(e) => setProdFormName(e.target.value)}
            required
          />
          <Select
            label="Product Category"
            options={[
              { label: "Storage", value: "Storage" },
              { label: "Networking", value: "Networking" },
              { label: "Accessories", value: "Accessories" },
              { label: "Tools", value: "Tools" },
            ]}
            value={prodFormCategory}
            onChange={(e: any) => setProdFormCategory(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Initial Stock *"
              type="number"
              placeholder="10"
              value={prodFormStock}
              onChange={(e) => setProdFormStock(e.target.value)}
              required
            />
            <Input
              label="Safety Limit *"
              type="number"
              placeholder="5"
              value={prodFormThreshold}
              onChange={(e) => setProdFormThreshold(e.target.value)}
              required
            />
            <Input
              label="Unit Cost ($) *"
              placeholder="45.00"
              value={prodFormUnitCost}
              onChange={(e) => setProdFormUnitCost(e.target.value)}
              required
            />
          </div>
          <Button variant="primary" type="submit" className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Register Product SKU
          </Button>
        </form>
      </Modal>

      {/* CREATE NEW SUPPLIER MODAL */}
      <Modal isOpen={newSupplierOpen} onClose={() => setNewSupplierOpen(false)} title="Add Supplier Profile">
        <form onSubmit={handleAddSupplier} className="flex flex-col gap-4 font-body">
          <Input
            label="Supplier Corporate Name *"
            placeholder="e.g. Cisco Systems Direct"
            value={supFormName}
            onChange={(e) => setSupFormName(e.target.value)}
            required
          />
          <Input
            label="Contact Email Address *"
            type="email"
            placeholder="e.g. orders@cisco.com"
            value={supFormContact}
            onChange={(e) => setSupFormContact(e.target.value)}
            required
          />
          <Input
            label="Corporate Phone Number"
            placeholder="e.g. 800-553-6387"
            value={supFormPhone}
            onChange={(e) => setSupFormPhone(e.target.value)}
          />
          <Button variant="primary" type="submit" className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Add Supplier Profile
          </Button>
        </form>
      </Modal>

      {/* CREATE NEW PURCHASE ORDER MODAL */}
      <Modal isOpen={newPoOpen} onClose={() => setNewPoOpen(false)} title="Compile Purchase Order (Stock Refill)">
        <form onSubmit={handleAddPo} className="flex flex-col gap-4 font-body">
          <Select
            label="Refill Product SKU"
            options={products.map(p => ({ label: `${p.sku} - ${p.name}`, value: p.sku }))}
            value={poFormSku}
            onChange={(e: any) => setPoFormSku(e.target.value)}
          />
          <Input
            label="Refill Quantity *"
            type="number"
            placeholder="e.g. 10"
            value={poFormQty}
            onChange={(e) => setPoFormQty(e.target.value)}
            required
          />
          <Select
            label="Supplier Vendor"
            options={suppliers.map(s => ({ label: s.name, value: s.name }))}
            value={poFormSupplier}
            onChange={(e: any) => setPoFormSupplier(e.target.value)}
          />
          <Button variant="primary" type="submit" className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Authorize Purchase Order
          </Button>
        </form>
      </Modal>

      {/* CREATE NEW MATERIAL ISSUE MODAL */}
      <Modal isOpen={newIssueOpen} onClose={() => setNewIssueOpen(false)} title="Issue Parts to Support Incident">
        <form onSubmit={handleAddIssue} className="flex flex-col gap-4 font-body">
          <Input
            label="Incident Ticket Code *"
            placeholder="e.g. RF-100247"
            value={issueFormTicketId}
            onChange={(e) => setIssueFormTicketId(e.target.value)}
            required
          />
          <Select
            label="Select Product SKU to Issue"
            options={products.map(p => ({ label: `${p.sku} - ${p.name} (Stock: ${p.stock})`, value: p.sku }))}
            value={issueFormSku}
            onChange={(e: any) => setIssueFormSku(e.target.value)}
          />
          <Input
            label="Quantity to Deduct *"
            type="number"
            placeholder="e.g. 1"
            value={issueFormQty}
            onChange={(e) => setIssueFormQty(e.target.value)}
            required
          />
          <Button variant="primary" type="submit" className="w-full mt-4" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Deduct Stock & Issue Material
          </Button>
        </form>
      </Modal>

      {/* GENERATE NEW INVOICE MODAL */}
      <Modal isOpen={newInvoiceModalOpen} onClose={() => setNewInvoiceModalOpen(false)} title="Generate New Client Invoice">
        <form onSubmit={handleGenerateInvoiceSubmit} className="flex flex-col gap-4 font-body">
          <Select
            label="Repair Incident Ticket Reference *"
            options={(bookingsData || [])
              .filter((b: any) => b.status === "completed" || b.status === "assigned" || b.status === "in_progress")
              .map((b: any) => ({ label: `${b.ticketId} - ${b.name} (${b.deviceType || b.operatingSystem})`, value: b.id }))}
            value={invFormBookingId}
            onChange={(e: any) => setInvFormBookingId(e.target.value)}
          />
          <Input
            label="Base Billable Amount ($) *"
            placeholder="e.g. 150.00"
            value={invFormAmount}
            onChange={(e) => setInvFormAmount(e.target.value)}
            required
          />
          <div className="bg-[#111827]/40 border border-border/80 rounded-lg p-4 text-[10px] text-muted leading-relaxed">
            <span className="block font-semibold text-text mb-1 flex items-center gap-1">
              <Percent size={12} className="text-secondary" />
              GST Tax Calculation Summary:
            </span>
            Standard tax will automatically append 18% GST (9% CGST + 9% SGST) to the final billable total in PDF prints.
          </div>
          <Button variant="primary" type="submit" isLoading={generateInvoiceMutation.isPending} className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }}>
            Generate GST Invoice
          </Button>
        </form>
      </Modal>
    </div>
  );
};
