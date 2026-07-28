import React, { useState } from "react";
import { useNavigate } from "react-router";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Wrench
} from "lucide-react";
import { Button, Card, Input, GlowDivider } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

interface FAQItem {
  id: string;
  category: "General" | "Technical" | "Billing";
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "General",
    q: "Do I need to sign up or log in to request a service?",
    a: "No! RemoteFix is designed with a zero-friction philosophy. Customer login is completely optional. Anyone can request remote support or an on-site technician as a guest. Upon submission, you receive an automated Ticket ID that allows real-time tracking.",
  },
  {
    id: "faq-2",
    category: "General",
    q: "How do I track my service request as a guest?",
    a: "Simply navigate to the 'Track Service' page and enter your Ticket ID (e.g. RF-20260728-000123) along with your registered mobile number. Our system queries Azure SQL in real time to show live milestones, assigned technician details, and visit schedules.",
  },
  {
    id: "faq-3",
    category: "General",
    q: "Can I link my guest booking to an account later?",
    a: "Yes. If you register or sign in to a RemoteFix customer account using the same mobile number or email address, you can click 'Link Guest Booking' inside your Customer Dashboard to merge all past tickets under your profile.",
  },
  {
    id: "faq-4",
    category: "General",
    q: "What regions and cities do your on-site technicians cover?",
    a: "We maintain on-site technician dispatches across all major metro areas and tier-1 business hubs. For remote IT diagnostics, our service is available nationwide 24 hours a day, 7 days a week.",
  },
  {
    id: "faq-5",
    category: "Technical",
    q: "How secure is remote support? Can technicians access my device later?",
    a: "Our remote diagnostic sessions are strictly client-initiated over 256-bit AES encrypted channels. You must explicitly launch the session client and share the session PIN. Once the technician closes the ticket and you exit the client, all access terminates completely.",
  },
  {
    id: "faq-6",
    category: "Technical",
    q: "What happens if an issue cannot be resolved remotely?",
    a: "If our systems engineer determines during remote diagnostics that the failure is hardware-based (e.g., failed SSD, damaged motherboard, dead power supply), we will immediately credit your remote fee towards an on-site technician dispatch or hardware replacement.",
  },
  {
    id: "faq-7",
    category: "Technical",
    q: "What certifications do your IT engineers hold?",
    a: "Every RemoteFix technician holds active industry-standard certifications including Cisco CCNA/CCNP, Microsoft 365 Enterprise Administrator, CompTIA Security+, or CISSP cybersecurity credentials.",
  },
  {
    id: "faq-8",
    category: "Technical",
    q: "Do you supply replacement parts for hardware upgrades?",
    a: "Yes. We source enterprise-grade storage drives (NVMe SSDs), network switches, Ethernet cabling (Cat6/Cat7), routers, and server components directly from authorized OEM distributors with full manufacturer warranty coverage.",
  },
  {
    id: "faq-9",
    category: "Billing",
    q: "Are prices inclusive of taxes (GST)?",
    a: "All invoice line items display a transparent tax breakdown. Invoices include standard 18% GST (9% CGST + 9% SGST), and full tax invoices are generated automatically for business tax compliance.",
  },
  {
    id: "faq-10",
    category: "Billing",
    q: "What payment methods do you support?",
    a: "We accept major credit/debit cards (Visa, MasterCard, Amex), UPI payments, NetBanking, and corporate purchase orders for AMC contract holders. Guest bookings can be paid online or upon technician arrival.",
  },
  {
    id: "faq-11",
    category: "Billing",
    q: "What is your refund and SLA guarantee policy?",
    a: "We offer a 100% Service SLA Guarantee. If our technician is unable to diagnose or resolve the fault stated in your booking request, your diagnostic fee is fully refunded within 3-5 business days.",
  },
  {
    id: "faq-12",
    category: "Billing",
    q: "What is included in a Corporate Annual Maintenance Contract (AMC)?",
    a: "Corporate AMC plans cover up to 10 endpoints, scheduled monthly on-site checkups, automated NAS/Cloud backups, CCTV & firewall maintenance, priority 15-minute SLA dispatch, and next-business-day hardware swaps.",
  },
];

export const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const navigate = useNavigate();

  const categories = ["All", "General", "Technical", "Billing"];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  // Structured JSON-LD schema for Google FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a,
      },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-body">
      <SEO
        title="Frequently Asked Questions (FAQ) | RemoteFix"
        description="Find answers regarding RemoteFix zero-login guest bookings, Ticket ID tracking, remote desktop security standards, GST billing, and on-site SLAs."
        canonicalUrl="https://remotefix.com/faq"
        jsonLd={faqSchema}
      />

      {/* HEADER SECTION */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          Help Desk &amp; Knowledge Base
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Frequently Asked Questions
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto leading-relaxed text-sm">
          Everything you need to know about booking, security protocols, guest tracking, and corporate billing.
        </p>
      </div>

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
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

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs"
          />
          <Search className="absolute left-3.5 top-3.5 text-muted w-4 h-4" />
        </div>
      </div>

      {/* ACCORDION LIST */}
      {filteredFaqs.length === 0 ? (
        <Card className="text-center py-16 text-muted">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No questions match your filter.</p>
          <p className="text-xs mt-1">Try clearing your search or category filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <Card
                key={faq.id}
                glowColor={isOpen ? "cyan" : "none"}
                className={`cursor-pointer select-none p-5 transition-all duration-300 ${
                  isOpen ? "border-primary/50 bg-[#111827]/80" : ""
                }`}
                onClick={() => toggleFaq(faq.id)}
              >
                <div className="flex justify-between items-start gap-4">
                  <span className="font-display font-bold text-base text-text flex gap-3 items-start">
                    <span className="text-xs font-semibold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shrink-0 mt-0.5">
                      {faq.category}
                    </span>
                    {faq.q}
                  </span>
                  <span className="text-muted mt-1 shrink-0">
                    {isOpen ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} />}
                  </span>
                </div>

                {isOpen && (
                  <div className="mt-4 pl-2 border-t border-border/40 pt-4 text-xs text-muted leading-relaxed font-body">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <GlowDivider color="cyan" className="my-12" />

      {/* STILL NEED HELP CTA */}
      <Card className="p-8 text-center relative overflow-hidden" glowColor="cyan">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full border border-primary/20 text-primary">
            <MessageSquare size={28} />
          </div>
          <h2 className="text-2xl font-bold font-display text-text">Still Have Questions?</h2>
          <p className="text-xs text-muted max-w-md leading-relaxed font-body">
            Our systems engineers and support desk are available 24/7. Reach out directly or initiate a service request immediately.
          </p>
          <div className="flex gap-4 flex-wrap justify-center mt-2">
            <Button
              variant="primary"
              glow
              className="flex items-center gap-2"
              onClick={() => navigate("/contact")}
            >
              Contact Support
              <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate("/book")}>
              Launch Booking Wizard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
