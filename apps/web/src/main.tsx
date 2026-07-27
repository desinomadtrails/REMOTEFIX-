import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./layouts/MainLayout.js";
import { Home } from "./pages/Home.js";
import { Services } from "./pages/Services.js";
import { BookService } from "./pages/BookService.js";
import { Pricing } from "./pages/Pricing.js";
import { FAQ } from "./pages/FAQ.js";
import { Blog } from "./pages/Blog.js";
import { Contact } from "./pages/Contact.js";
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { CustomerDashboard } from "./pages/CustomerDashboard.js";
import { EngineerDashboard } from "./pages/EngineerDashboard.js";
import { BookSuccess } from "./pages/BookSuccess.js";
import { TrackService } from "./pages/TrackService.js";
import { Card } from "@remotefix/ui";
import "./index.css";

const queryClient = new QueryClient();

// Privacy Policy Component
const PrivacyPolicy = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 font-body">
    <Card glowColor="cyan" className="p-8 md:p-12">
      <h1 className="text-3xl font-black font-display text-text mb-6">Privacy Policy</h1>
      <div className="text-muted leading-relaxed space-y-6 text-sm">
        <p>At RemoteFix, we respect your data and credentials. This privacy policy describes how we collect, process, and protect information when you book remote diagnostics or request physical on-site visits.</p>
        <h2 className="text-xl font-bold font-display text-text mt-4">1. Remote Desktop Session Security</h2>
        <p>All remote diagnostics sessions are client-initiated. Session data is encrypted in transit using 256-bit AES mechanisms. Our technicians cannot establish connection loops without you entering active session codes. We do not store remote access logs beyond session termination.</p>
        <h2 className="text-xl font-bold font-display text-text mt-4">2. Database Records</h2>
        <p>Your name, email address, company coordinates, and diagnostic records are stored on secure Azure SQL Database clusters. Financial transactions (invoices and credit card numbers) are processed through encrypted payment pathways; we do not store CVV digits or full card details in our database logs.</p>
      </div>
    </Card>
  </div>
);

// Terms of Service Component
const TermsOfService = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 font-body">
    <Card glowColor="cyan" className="p-8 md:p-12">
      <h1 className="text-3xl font-black font-display text-text mb-6">Terms of Service</h1>
      <div className="text-muted leading-relaxed space-y-6 text-sm">
        <p>By requesting remote assistance or scheduling on-site engineer dispatches, you agree to the following Service Terms of Service.</p>
        <h2 className="text-xl font-bold font-display text-text mt-4">1. Diagnostic Authorization</h2>
        <p>You authorize RemoteFix technicians to perform software diagnostics, install patch updates, and audit local network settings. You agree to maintain a complete system backup before launching remote sessions. RemoteFix is not liable for data loss caused by pre-existing hardware failures.</p>
        <h2 className="text-xl font-bold font-display text-text mt-4">2. SLA Guarantee & Refunds</h2>
        <p>If our technicians verify that the system issues described in your booking request cannot be resolved remotely (and you decide not to proceed with physical on-site visits), your diagnostic fee will be refunded immediately.</p>
      </div>
    </Card>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<BookService />} />
            <Route path="/book/success" element={<BookSuccess />} />
            <Route path="/track" element={<TrackService />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/engineer" element={<EngineerDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
