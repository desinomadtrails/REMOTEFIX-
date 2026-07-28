import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Tag, Search, ArrowRight, ShieldCheck, Zap, Wrench } from "lucide-react";
import { Button, Card, Input, GlowDivider } from "@remotefix/ui";
import { api } from "../services/api.js";
import { formatCurrency } from "@remotefix/utils";
import { SEO } from "../components/SEO.js";

// Local fallback services in case the database is empty or connection is offline
const FALLBACK_SERVICES = [
  {
    id: "fallback-remote",
    name: "Remote IT Support",
    description: "Fast diagnostics, troubleshooting, software fixes, and optimizations handled securely via client-initiated remote desktop utilities.",
    category: "Support",
    price: "79.00",
    estimatedDurationMinutes: 60,
  },
  {
    id: "fallback-wifi",
    name: "WiFi & Network Configuration",
    description: "Setting up router settings, optimizing channels, configuring guest networks, and fixing dead zones for home and business connections.",
    category: "Networking",
    price: "129.00",
    estimatedDurationMinutes: 90,
  },
  {
    id: "fallback-virus",
    name: "Virus & Malware Removal",
    description: "Full system scan, quarantine of suspicious entities, adware cleanup, registry repairs, and installing enterprise protection suites.",
    category: "Security",
    price: "99.00",
    estimatedDurationMinutes: 75,
  },
  {
    id: "fallback-os",
    name: "OS Clean Installation",
    description: "Fresh install of Windows, macOS, or Linux. Complete backup, partition formatting, system install, drivers matching, and OS configurations.",
    category: "Installation",
    price: "149.00",
    estimatedDurationMinutes: 120,
  },
  {
    id: "fallback-backup",
    name: "Data Backup & Recovery",
    description: "Salvaging corrupted documents, recovery from damaged sectors or accidentally formatted files, and setting up automated NAS/Cloud vault backups.",
    category: "Storage",
    price: "199.00",
    estimatedDurationMinutes: 180,
  },
  {
    id: "fallback-consulting",
    name: "IT Consultation",
    description: "Structured architecture review, sizing migrations, assessing hardware lifecycles, and drafting cybersecurity risk management strategies.",
    category: "Consulting",
    price: "250.00",
    estimatedDurationMinutes: 60,
  },
];

export const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await api.getServices();
      return res.services || [];
    },
    retry: 1,
  });

  const rawServices = data && data.length > 0 ? data : FALLBACK_SERVICES;

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(rawServices.map((s: any) => s.category)))];

  // Filter services
  const filteredServices = rawServices.filter((service: any) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": rawServices.map((s: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Service",
        "name": s.name,
        "description": s.description,
        "offers": {
          "@type": "Offer",
          "price": s.price,
          "priceCurrency": "USD",
        },
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-body">
      <SEO
        title="On-Demand IT Services & Repairs | RemoteFix"
        description="Explore our IT service catalog: Remote Support, WiFi Network Setup, Malware Removal, OS Clean Installs, Data Recovery, and Enterprise IT Consulting."
        canonicalUrl="https://remotefix.com/services"
        jsonLd={serviceSchema}
      />

      {/* Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Wrench className="w-3.5 h-3.5" />
          Catalog of Solutions
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          On-Demand IT Services
        </h1>
        <p className="text-muted font-body mt-4 max-w-lg mx-auto leading-relaxed text-sm">
          Transparent pricing, certified engineers, and rapid SLAs. Select any service to initiate guest booking.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 border-b border-border/40 pb-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-display text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-[#030712] shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                  : "bg-[#111827]/50 text-muted border border-border hover:bg-surface-hover hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 text-muted w-4 h-4" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 text-muted font-body">
          No services match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service: any) => (
            <Card
              key={service.id}
              glowColor="cyan"
              className="flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary font-display uppercase tracking-wider bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <Tag size={10} />
                  {service.category}
                </span>
                <span className="text-2xl font-black font-display text-text">
                  {formatCurrency(parseFloat(service.price))}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold font-display text-text mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-muted font-body leading-relaxed flex-grow mb-6">
                {service.description}
              </p>

              {/* Footer specs */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                <span className="flex items-center gap-1.5 text-xs text-muted font-body">
                  <Clock size={14} className="text-primary" />
                  Est: {service.estimatedDurationMinutes} mins
                </span>
                <Button
                  variant="cyber"
                  size="sm"
                  className="flex items-center gap-1 text-xs group"
                  onClick={() => navigate(`/book?serviceId=${service.id}`)}
                >
                  Book Support
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <GlowDivider color="gradient" className="my-16" />

      {/* SLA ASSURANCE */}
      <div className="bg-[#111827]/40 border border-border/80 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold font-display text-text">Guaranteed Certified Engineers</h4>
            <p className="text-xs text-muted font-body mt-1 max-w-xl leading-relaxed">
              All services are performed by CISSP, Microsoft 365, or Cisco CCNA certified technicians. Instant guest booking with real-time status tracking.
            </p>
          </div>
        </div>
        <Button variant="primary" glow onClick={() => navigate("/book")}>
          Launch Booking Wizard
        </Button>
      </div>
    </div>
  );
};
