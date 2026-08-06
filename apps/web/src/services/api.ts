const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = localStorage.getItem("rf_token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle expired Access Tokens with automatic silent Refresh Token rotation
  if (
    response.status === 401 &&
    !endpoint.includes("/api/auth/login") &&
    !endpoint.includes("/api/auth/refresh") &&
    !endpoint.includes("/api/auth/register")
  ) {
    const refreshToken = localStorage.getItem("rf_refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.token) {
            localStorage.setItem("rf_token", refreshData.token);
            if (refreshData.refreshToken) {
              localStorage.setItem("rf_refresh_token", refreshData.refreshToken);
            }
            headers.set("Authorization", `Bearer ${refreshData.token}`);
            // Retry original request with new token
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
          } else {
            localStorage.removeItem("rf_token");
            localStorage.removeItem("rf_refresh_token");
            localStorage.removeItem("rf_user");
            window.dispatchEvent(new Event("auth:logout"));
          }
        } else {
          localStorage.removeItem("rf_token");
          localStorage.removeItem("rf_refresh_token");
          localStorage.removeItem("rf_user");
          window.dispatchEvent(new Event("auth:logout"));
        }
      } catch {
        localStorage.removeItem("rf_token");
        localStorage.removeItem("rf_refresh_token");
        localStorage.removeItem("rf_user");
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
  }

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

  async logout() {
    const refreshToken = localStorage.getItem("rf_refresh_token");
    return request<any>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  async refresh() {
    const refreshToken = localStorage.getItem("rf_refresh_token");
    return request<any>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  async getMe() {
    return request<any>("/api/auth/me");
  },

  async forgotPassword(email: string) {
    return request<any>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(body: { token: string; newPassword: string }) {
    return request<any>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async verifyEmail(body: { token?: string; otp?: string; email?: string }) {
    return request<any>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async resendOtp(email: string) {
    return request<any>("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
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

  async updateBookingStatus(id: string, body: { status: string; engineerId?: string; remarks?: string; partsUsed?: string }) {
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

  // Project Registry & AI pipeline API
  async getProjects() {
    return request<{ success: boolean; projects: any[] }>("/api/projects");
  },

  async getProjectById(id: string) {
    return request<{ success: boolean; project: any }>(`/api/projects/${id}`);
  },

  async createProject(body: { name: string; path: string; description?: string }) {
    return request<{ success: boolean; project: any }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async deleteProject(id: string) {
    return request<{ success: boolean }>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },

  async getRepositoryIntelligence(id: string) {
    return request<{ success: boolean; repository?: any; summary?: any }>(`/api/projects/${id}/repository`);
  },

  async getWorkspaceContext(id: string) {
    return request<{ success: boolean; context: any }>(`/api/projects/${id}/context`);
  },

  async runOrchestrator(id: string, body: { request: string }) {
    return request<{ success: boolean; report: any }>(`/api/projects/${id}/run`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
