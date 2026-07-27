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

  async register(body: any) {
    return request<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getMe() {
    return request<any>("/api/auth/me");
  },

  async oauthLogin(body: any) {
    return request<any>("/api/auth/oauth-login", {
      method: "POST",
      body: JSON.stringify(body),
    });
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
  async createBooking(body: any) {
    return request<any>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getBookings() {
    return request<any>("/api/bookings");
  },

  async getBookingById(id: string) {
    return request<any>(`/api/bookings/${id}`);
  },

  async updateBookingStatus(id: string, body: { status: string; engineerId?: string }) {
    return request<any>(`/api/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async uploadBookingImage(id: string, imageBase64: string) {
    return request<any>(`/api/bookings/${id}/images`, {
      method: "POST",
      body: JSON.stringify({ image: imageBase64 }),
    });
  },

  // Support Tickets API
  async createTicket(body: any) {
    return request<any>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getTickets() {
    return request<any>("/api/tickets");
  },

  async getTicketById(id: string) {
    return request<any>(`/api/tickets/${id}`);
  },

  async sendTicketMessage(id: string, message: string) {
    return request<any>(`/api/tickets/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  async updateTicketStatus(id: string, body: { status: string; engineerId?: string }) {
    return request<any>(`/api/tickets/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  // Invoices API
  async createInvoice(body: any) {
    return request<any>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getInvoices() {
    return request<any>("/api/invoices");
  },

  async getInvoiceById(id: string) {
    return request<any>(`/api/invoices/${id}`);
  },

  // Payments API
  async submitPayment(body: any) {
    return request<any>("/api/payments", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getPaymentsHistory() {
    return request<any>("/api/payments");
  },

  // Admin API
  async getAnalytics() {
    return request<any>("/api/admin/analytics");
  },

  async getAuditLogs() {
    return request<any>("/api/admin/logs");
  },

  // Seeding Utility
  async seedDatabase() {
    return request<any>("/api/seed", { method: "POST" });
  },

  // Service Requests
  async createServiceRequest(body: any) {
    return request<any>("/api/service-request", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async trackServiceRequest(ticketId: string, phone: string) {
    return request<any>(`/api/service-request/track?ticketId=${encodeURIComponent(ticketId)}&phone=${encodeURIComponent(phone)}`);
  },

  async linkGuestBooking(ticketId: string, phone: string) {
    return request<any>("/api/bookings/link", {
      method: "POST",
      body: JSON.stringify({ ticketId, phone }),
    });
  },
};
