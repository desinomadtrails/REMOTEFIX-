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
import { About } from "./pages/About.js";
import { Careers } from "./pages/Careers.js";
import { Privacy } from "./pages/Privacy.js";
import { Terms } from "./pages/Terms.js";
import "./index.css";

const queryClient = new QueryClient();

// Query client initialization

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
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
