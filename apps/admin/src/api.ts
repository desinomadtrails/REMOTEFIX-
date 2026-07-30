const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("rf_token");
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "An unexpected error occurred.");
  }

  return data as T;
}

export const api = {
  // Auth API
  async login(body: any) {
    return request<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getMe() {
    return request<any>("/api/auth/me");
  },

  // Services API
  async getServices() {
    return request<any>("/api/services");
  },

  async getAllServicesAdmin() {
    return request<any>("/api/services/all");
  },

  async createService(body: any) {
    return request<any>("/api/services", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateService(id: string, body: any) {
    return request<any>(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async toggleService(id: string) {
    return request<any>(`/api/services/${id}/toggle`, {
      method: "PATCH",
    });
  },

  // Bookings API
  async getBookings() {
    return request<any>("/api/bookings");
  },

  async updateBookingStatus(id: string, body: { status: string; engineerId?: string }) {
    return request<any>(`/api/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  // Invoices API
  async getInvoices() {
    return request<any>("/api/invoices");
  },

  // Audit Logs API
  async getAuditLogs() {
    return request<any>("/api/admin/logs");
  },

  // Database Seeding
  async seedDatabase() {
    return request<any>("/api/seed", { method: "POST" });
  },

  // Technician Workflow API
  async technicianCheckIn(bookingId: string, lat?: number, lng?: number) {
    return request<any>("/api/technician-workflow/check-in", {
      method: "POST",
      body: JSON.stringify({ bookingId, lat, lng }),
    });
  },

  async uploadWorkAssets(body: { bookingId: string; beforePhotos?: string[]; afterPhotos?: string[]; digitalSignature?: string; notes?: string }) {
    return request<any>("/api/technician-workflow/upload-work-assets", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async technicianCheckOut(bookingId: string, lat?: number, lng?: number, remarks?: string, partsUsed?: string) {
    return request<any>("/api/technician-workflow/check-out", {
      method: "POST",
      body: JSON.stringify({ bookingId, lat, lng, remarks, partsUsed }),
    });
  },

  async getTechnicianWorkLog(bookingId: string) {
    return request<any>(`/api/technician-workflow/log/${bookingId}`);
  },

  // Organizations Multi-Tenant API
  async getOrganizations() {
    return request<any>("/api/admin/organizations");
  },

  async createOrganization(body: any) {
    return request<any>("/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getOrgDepartments(orgId: string) {
    return request<any>(`/api/admin/organizations/${orgId}/departments`);
  },

  async createOrgDepartment(orgId: string, body: any) {
    return request<any>(`/api/admin/organizations/${orgId}/departments`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Assets ITAM API
  async getAssets() {
    return request<any>("/api/admin/assets");
  },

  async createAsset(body: any) {
    return request<any>("/api/admin/assets", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateAssetStatus(id: string, status: string) {
    return request<any>(`/api/admin/assets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // SLA Policies API
  async getSlaPolicies() {
    return request<any>("/api/admin/sla");
  },

  async createSlaPolicy(body: any) {
    return request<any>("/api/admin/sla", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async evaluateSlaBreaches() {
    return request<any>("/api/admin/sla/evaluate", {
      method: "POST",
    });
  },

  // AMC Contracts API
  async getAmcContracts() {
    return request<any>("/api/admin/amc");
  },

  async createAmcContract(body: any) {
    return request<any>("/api/admin/amc", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Roles & RBAC API
  async getRoles() {
    return request<any>("/api/admin/roles");
  },

  async createRole(body: any) {
    return request<any>("/api/admin/roles", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // AI Intelligence API
  async aiTriage(subject: string, description: string) {
    return request<any>("/api/ai/triage", {
      method: "POST",
      body: JSON.stringify({ subject, description }),
    });
  },

  async aiDiagnose(subject: string, description: string, deviceType?: string) {
    return request<any>("/api/ai/diagnose", {
      method: "POST",
      body: JSON.stringify({ subject, description, deviceType }),
    });
  },

  async aiSmartAssign(problemDescription: string, type: string, engineers: any[]) {
    return request<any>("/api/ai/smart-assign", {
      method: "POST",
      body: JSON.stringify({ problemDescription, type, engineers }),
    });
  },

  async aiPredictMaintenance(asset: any) {
    return request<any>("/api/ai/predict-maintenance", {
      method: "POST",
      body: JSON.stringify({ asset }),
    });
  },

  // RMM Endpoint Agent Console
  async getRmmEndpoints() {
    return request<any>("/api/rmm/admin/endpoints");
  },

  async getRmmScripts() {
    return request<any>("/api/rmm/admin/scripts");
  },

  async dispatchRmmScript(scriptId: string, endpointIds: string[]) {
    return request<any>("/api/rmm/admin/scripts/dispatch", {
      method: "POST",
      body: JSON.stringify({ scriptId, endpointIds }),
    });
  },

  // Enterprise SSO API
  async getSsoProviders() {
    return request<any>("/api/admin/sso");
  },

  async createSsoProvider(body: any) {
    return request<any>("/api/admin/sso", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Analytics
  async getAnalytics() {
    return request<any>("/api/admin/analytics");
  },

  // Customer Management APIs
  async getCustomers() {
    return request<any>("/api/admin/customers");
  },

  async createCustomer(body: any) {
    return request<any>("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateCustomer(id: string, body: any) {
    return request<any>(`/api/admin/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteCustomer(id: string) {
    return request<any>(`/api/admin/customers/${id}`, {
      method: "DELETE",
    });
  },

  // Technician / Engineer Management APIs
  async getEngineers() {
    return request<any>("/api/admin/engineers");
  },

  async createEngineer(body: any) {
    return request<any>("/api/admin/engineers", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateEngineer(id: string, body: any) {
    return request<any>(`/api/admin/engineers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async deleteEngineer(id: string) {
    return request<any>(`/api/admin/engineers/${id}`, {
      method: "DELETE",
    });
  },

  // Billing & Invoices APIs
  async createInvoice(body: any) {
    return request<any>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateInvoice(id: string, body: any) {
    return request<any>(`/api/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
