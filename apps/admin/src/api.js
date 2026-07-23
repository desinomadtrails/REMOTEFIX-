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
    async getMe() {
        return request("/api/auth/me");
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
    async getBookings() {
        return request("/api/bookings");
    },
    async updateBookingStatus(id, body) {
        return request(`/api/bookings/${id}/status`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },
    // Invoices API
    async getInvoices() {
        return request("/api/invoices");
    },
    // Audit Logs API
    async getAuditLogs() {
        return request("/api/logs");
    },
    // Database Seeding
    async seedDatabase() {
        return request("/api/seed", { method: "POST" });
    },
};
//# sourceMappingURL=api.js.map