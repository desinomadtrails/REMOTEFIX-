import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { 
  Monitor, 
  Wifi, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Award,
  Star,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Zap,
  Lock,
  Search
} from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { AuroraBackground } from "../components/AuroraBackground.js";
import { SEO } from "../components/SEO.js";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <Monitor className="w-6 h-6 text-primary" />,
      title: "Remote IT Diagnostics",
      desc: "Fast, client-initiated software troubleshooting and configurations over safe, encrypted pipelines.",
      type: "remote",
    },
    {
      icon: <Wifi className="w-6 h-6 text-primary" />,
      title: "Network Optimization",
      desc: "Signal mapping, router diagnostics, and guest SSID setups for optimal wifi bandwidth coverage.",
      type: "onsite",
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-primary" />,
      title: "Cyber Security Scan",
      desc: "Malware isolation, active firewall audits, system patch deployment, and vulnerability checks.",
      type: "remote",
    },
    {
      icon: <Cpu className="w-6 h-6 text-primary" />,
      title: "On-Site Hardware Integrations",
      desc: "Physical configuration of corporate server racks, NAS file vaults, CCTV systems, and workstations.",
      type: "onsite",
    },
  ];

  const valueProps = [
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "15-Min Response Guarantee",
      desc: "Emergency requests are triaged instantly with technician dispatch or cloud support starting in minutes.",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-primary" />,
      title: "Account-Free Checkout",
      desc: "No username or credentials needed. Simply describe the fault, book, and track using your Ticket ID.",
    },
    {
      icon: <Award className="w-5 h-5 text-primary" />,
      title: "Certified Systems Engineers",
      desc: "Every technician holds active CISSP, Microsoft 365, Cisco, or Google Cloud systems certifications.",
    },
  ];

  const steps = [
    { num: "01", title: "Select Service Category", desc: "Choose onsite visit, remote support, or emergency SLA dispatch." },
    { num: "02", title: "Provide Device & Address Specs", desc: "Input device type, brand, and problem symptoms in our guest booking wizard." },
    { num: "03", title: "Receive Unique Ticket ID", desc: "Your request is registered in Azure SQL. A trackable ID is generated instantly." },
    { num: "04", title: "Track Progress & Confirm", desc: "Monitor live status milestones from submission to technician completion." },
  ];

  const reviews = [
    { name: "Sarah Jenkins", role: "Office Operations Mgr", rating: 5, comment: "Our company router went offline. We triggered the emergency protocol, and a RemoteFix engineer arrived onsite in 12 minutes to resolve the fault. Superb service!" },
    { name: "David Chen", role: "Creative Director", rating: 5, comment: "I love that I didn't have to create another login account. I just input my details, got my Ticket ID, and tracked the remote virus scan live. Highly recommend!" },
    { name: "Robert Miller", role: "Hotel Systems Lead", rating: 5, comment: "Excellent CCTV and WiFi access point setup. The pricing was transparent, and the technician was certified and professional." },
  ];

  const faqs = [
    { q: "Do I need to sign up for an account to request a service?", a: "No. RemoteFix is built for zero friction. You can request on-site or remote support instantly as a guest. You will receive a Ticket ID to track progress." },
    { q: "How do I track my service ticket status?", a: "Go to the 'Track Service' page, enter your Ticket ID and Mobile Number. This queries our Azure SQL database in real-time to display the status and technician details." },
    { q: "Is the remote support connection secure?", a: "Yes. Remote sessions use client-initiated codes and are fully encrypted using 256-bit AES protocols. Our technicians cannot connect without your active session consent." },
  ];

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "RemoteFix IT Services Platform",
    "image": "https://remotefix.com/og-image.jpg",
    "description": "Enterprise-grade remote and on-site IT support platform. Fast diagnostics, network configuration, and hardware repair.",
    "telephone": "+1-800-555-7349",
    "email": "support@remotefix.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100 Enterprise Way, Suite 300",
      "addressLocality": "Azure City",
      "addressCountry": "US",
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "$$",
  };

  return (
    <div className="relative min-h-screen pt-12 pb-24 overflow-hidden">
      <SEO
        title="RemoteFix | Instant Remote & On-Site IT Support Platform"
        description="Get enterprise-grade remote and on-site IT support. No login required. Submit your device repair request as a guest, receive a trackable Ticket ID, and monitor progress real-time."
        canonicalUrl="https://remotefix.com/"
        jsonLd={orgSchema}
      />
      
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-body">
        
        {/* HERO SECTION */}
        <div className="text-center pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-6"
          >
            <Settings className="w-3.5 h-3.5 animate-spin" />
            Zero Friction IT Service Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Instant IT Support. <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              No Sign-Up Required.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted font-body max-w-2xl mx-auto leading-relaxed"
          >
            Submit your device diagnostic request as a guest. Get a secure Ticket ID instantly and track certified technicians in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              glow
              className="w-full sm:w-auto flex items-center justify-center gap-2 group"
              onClick={() => navigate("/book")}
            >
              Book a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center gap-2"
              onClick={() => navigate("/track")}
            >
              <Search className="w-4 h-4" />
              Track Ticket
            </Button>
          </motion.div>
        </div>

        <GlowDivider color="gradient" />

        {/* SERVICES PREVIEW */}
        <div className="py-20" id="services">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">Our Specialized IT Services</h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto text-sm">
              We service corporate infrastructures and personal setups with certified efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, idx) => (
              <Card key={idx} className="flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform" glowColor="cyan">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold font-display text-text">{svc.title}</h3>
                <p className="text-xs text-muted leading-relaxed font-body flex-grow">{svc.desc}</p>
                <button
                  onClick={() => navigate(`/book?type=${svc.type}`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer pt-2"
                >
                  Book this service <ArrowRight size={12} />
                </button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate("/services")}>
              Explore Full Service Catalog
            </Button>
          </div>
        </div>

        <GlowDivider color="cyan" />

        {/* WHY CHOOSE REMOTEFIX */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">Why Choose RemoteFix</h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto text-sm">
              Enterprise-grade diagnostic pipelines engineered for reliability and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, idx) => (
              <Card key={idx} className="flex flex-col gap-4 text-center items-center p-6" glowColor="none">
                <div className="p-3 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  {prop.icon}
                </div>
                <h3 className="text-lg font-bold font-display text-text">{prop.title}</h3>
                <p className="text-xs text-muted leading-relaxed font-body">{prop.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <GlowDivider color="gradient" />

        {/* HOW IT WORKS */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">How It Works</h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto text-sm">
              4 simple steps to resolve your hardware and network issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div key={idx} className="flex flex-col gap-4 bg-[#111827]/30 border border-border/60 rounded-xl p-5 relative hover:border-primary/40 transition-colors">
                <span className="text-3xl font-black font-display text-primary/30 absolute top-4 right-4">{st.num}</span>
                <h3 className="text-base font-bold font-display text-text mt-4">{st.title}</h3>
                <p className="text-xs text-muted leading-relaxed font-body">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <GlowDivider color="cyan" />

        {/* CUSTOMER REVIEWS */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">Client Testimonials</h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto text-sm">
              What users say about our on-site and remote systems maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <Card key={idx} className="flex flex-col gap-4 relative overflow-hidden" glowColor="none">
                <div className="flex gap-1 text-primary">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-muted leading-relaxed italic">"{rev.comment}"</p>
                <div className="flex items-center gap-2 border-t border-border/50 pt-3 mt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary font-display">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text">{rev.name}</h4>
                    <span className="text-[10px] text-muted">{rev.role}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <GlowDivider color="gradient" />

        {/* FAQ SECTION */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">Frequently Asked Questions</h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto text-sm">
              Quick answers about bookings, security, and scheduling.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="flex flex-col gap-2 p-5" glowColor="none">
                <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                  <HelpCircle size={16} className="text-primary shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-muted leading-relaxed pl-6">{faq.a}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" className="text-xs text-primary hover:underline" onClick={() => navigate("/faq")}>
              View all FAQs &rarr;
            </Button>
          </div>
        </div>

        <GlowDivider color="cyan" />

        {/* CONTACT BANNER */}
        <div className="py-20">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 relative overflow-hidden" glowColor="cyan">
            <div className="absolute -bottom-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/15 blur-[60px]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-bold font-display text-text">Get in Touch</h2>
                <p className="text-xs text-muted leading-relaxed font-body">
                  Questions about contracts or corporate SLA maintenance? Reach our systems engineers 24/7.
                </p>
                <div className="flex flex-col gap-4 text-xs font-body">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-primary" />
                    <span>support@remotefix.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-primary" />
                    <span>+1 (800) 555-RFIX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-primary" />
                    <span>100 Enterprise Way, Suite 300, Azure City</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827]/40 border border-border/60 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold font-display text-text">Direct Inquiries</h3>
                <p className="text-[11px] text-muted">
                  For immediate device repairs or local network audits, please use the guest booking wizard.
                </p>
                <Button variant="primary" className="w-full mt-2" onClick={() => navigate("/book")} glow>
                  Launch Booking Wizard
                </Button>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
