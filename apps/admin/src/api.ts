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
    return request<any>("/api/logs");
  },

  // Database Seeding
  async seedDatabase() {
    return request<any>("/api/seed", { method: "POST" });
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
};
