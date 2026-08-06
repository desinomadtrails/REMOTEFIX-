import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./layouts/MainLayout.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { AuthProvider } from "./context/AuthContext.js";

// Pages
import { Home } from "./pages/Home.js";
import { About } from "./pages/About.js";
import { Services } from "./pages/Services.js";
import { Pricing } from "./pages/Pricing.js";
import { FAQ } from "./pages/FAQ.js";
import { Contact } from "./pages/Contact.js";
import { Blog } from "./pages/Blog.js";
import { Careers } from "./pages/Careers.js";
import { BookService } from "./pages/BookService.js";
import { BookSuccess } from "./pages/BookSuccess.js";
import { TrackService } from "./pages/TrackService.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { Privacy } from "./pages/Privacy.js";
import { Terms } from "./pages/Terms.js";
import { CustomerDashboard } from "./pages/CustomerDashboard.js";
import { CustomerAssets } from "./pages/CustomerAssets.js";
import { EngineerDashboard } from "./pages/EngineerDashboard.js";
import { Dashboard } from "./pages/Dashboard.js";
import { ProjectDetails } from "./pages/ProjectDetails.js";
import { Settings } from "./pages/Settings.js";
import { NotFound } from "./pages/NotFound.js";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/knowledge-base" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/book" element={<BookService />} />
              <Route path="/book/success" element={<BookSuccess />} />
              <Route path="/track" element={<TrackService />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/assets"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerAssets />
                  </ProtectedRoute>
                }
              />

              {/* Protected Engineer Routes */}
              <Route
                path="/engineer"
                element={
                  <ProtectedRoute requiredRole="engineer">
                    <EngineerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin & Workspace Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
