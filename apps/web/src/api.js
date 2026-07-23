const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";
async function request(endpoint, options = {}) {
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
    return data;
}
export const api = {
    // Auth API
    async login(body) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async register(body) {
        return request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async getMe() {
        return request("/api/auth/me");
    },
    async oauthLogin(body) {
        return request("/api/auth/oauth-login", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    // Services API
    async getServices() {
        return request("/api/services");
    },
    async getAllServicesAdmin() {
        return request("/api/services/all");
    },
    async createService(body) {
        return request("/api/services", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async updateService(id, body) {
        return request(`/api/services/${id}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },
    async toggleService(id) {
        return request(`/api/services/${id}/toggle`, {
            method: "PATCH",
        });
    },
    // Bookings API
    async createBooking(body) {
        return request("/api/bookings", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async getBookings() {
        return request("/api/bookings");
    },
    async getBookingById(id) {
        return request(`/api/bookings/${id}`);
    },
    async updateBookingStatus(id, body) {
        return request(`/api/bookings/${id}/status`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },
    async uploadBookingImage(id, imageBase64) {
        return request(`/api/bookings/${id}/images`, {
            method: "POST",
            body: JSON.stringify({ image: imageBase64 }),
        });
    },
    // Support Tickets API
    async createTicket(body) {
        return request("/api/tickets", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async getTickets() {
        return request("/api/tickets");
    },
    async getTicketById(id) {
        return request(`/api/tickets/${id}`);
    },
    async sendTicketMessage(id, message) {
        return request(`/api/tickets/${id}/messages`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    },
    async updateTicketStatus(id, body) {
        return request(`/api/tickets/${id}/status`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },
    // Invoices API
    async createInvoice(body) {
        return request("/api/invoices", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async getInvoices() {
        return request("/api/invoices");
    },
    async getInvoiceById(id) {
        return request(`/api/invoices/${id}`);
    },
    // Payments API
    async submitPayment(body) {
        return request("/api/payments", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    async getPaymentsHistory() {
        return request("/api/payments");
    },
    // Admin API
    async getAnalytics() {
        return request("/api/admin/analytics");
    },
    async getAuditLogs() {
        return request("/api/admin/logs");
    },
    // Seeding Utility
    async seedDatabase() {
        return request("/api/seed", { method: "POST" });
    },
};
//# sourceMappingURL=api.js.map