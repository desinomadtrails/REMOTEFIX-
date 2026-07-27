import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
  },
  build: {
    // Suppress the chunk size warning for the primary bundle
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Code-split: vendor libs in one chunk, page modules in separate chunks
        manualChunks(id) {
          // React ecosystem → vendor chunk
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          // TanStack Query → vendor chunk
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-query";
          }
          // Lucide icons → icons chunk
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // UI package → ui chunk
          if (id.includes("packages/ui")) {
            return "vendor-ui";
          }
          // Each page module → separate chunks (lazy-loaded)
          if (id.includes("/pages/reports/")) return "page-reports";
          if (id.includes("/pages/notifications/")) return "page-notifications";
          if (id.includes("/pages/settings/")) return "page-settings";
          if (id.includes("/pages/overview/")) return "page-overview";
          if (id.includes("/pages/bookings/")) return "page-bookings";
          if (id.includes("/pages/customers/")) return "page-customers";
          if (id.includes("/pages/technicians/")) return "page-technicians";
          if (id.includes("/pages/inventory/")) return "page-inventory";
          if (id.includes("/pages/billing/")) return "page-billing";
          if (id.includes("/pages/services/")) return "page-services";
          if (id.includes("/pages/logs/")) return "page-logs";
        },
      },
    },
  },
});
