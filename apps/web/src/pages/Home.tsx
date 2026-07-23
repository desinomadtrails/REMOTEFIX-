import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Monitor, Wifi, ShieldAlert, Cpu, Settings, PhoneCall, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { AuroraBackground } from "../components/AuroraBackground.js";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Monitor className="w-6 h-6 text-primary" />,
      title: "Remote Assistance",
      desc: "Instant diagnostics and software repairs over a secure, encrypted connection. Available 24/7.",
    },
    {
      icon: <Wifi className="w-6 h-6 text-primary" />,
      title: "Network & WiFi Optimizations",
      desc: "Channel matching, signal boosting, and structured cabling for homes and enterprise networks.",
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-primary" />,
      title: "Cyber Security & Audits",
      desc: "Virus removal, network firewalls, active threat scans, and compliance planning.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-primary" />,
      title: "Hardware Deployments",
      desc: "On-site installation of server cabinets, NAS arrays, workstations, and CCTV security cameras.",
    },
  ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 overflow-hidden">
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <div className="text-center pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-6"
          >
            <Settings className="w-3.5 h-3.5 animate-spin" />
            Next-Gen IT Support Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Zero Downtime. <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Enterprise-Grade IT Repairs
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted font-body max-w-2xl mx-auto leading-relaxed"
          >
            RemoteFix provides instant cloud support, local network audits, and on-site hardware integrations for modern businesses and individuals.
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
              className="w-full sm:w-auto flex items-center gap-2 group"
              onClick={() => navigate("/book")}
            >
              Book Service Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate("/services")}
            >
              Explore Services
            </Button>
          </motion.div>
        </div>

        <GlowDivider color="gradient" />

        {/* FEATURES SECTION */}
        <div className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-text">
              Comprehensive Tech Solutions
            </h2>
            <p className="text-muted font-body mt-3 max-w-md mx-auto">
              Our engineers possess elite certifications to handle complex enterprise network setups and urgent system restores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card glowColor="none" className="h-full flex flex-col items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold font-display text-text">{feat.title}</h3>
                  <p className="text-sm text-muted font-body leading-relaxed">{feat.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <GlowDivider color="cyan" />

        {/* TRUST BANNER */}
        <div className="py-16 glass rounded-2xl border border-border/80 p-8 md:p-12 relative overflow-hidden">
          {/* Accent glow corner */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[80px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold font-display text-text">
                Secure & Certified Operations
              </h2>
              <p className="text-muted font-body leading-relaxed">
                Security is our foundation. RemoteFix connections are protected by TLS 1.3, 256-bit AES encryption, and active session auditing. We comply with industry compliance rules.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-text font-body">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  M365 & Google Certified
                </div>
                <div className="flex items-center gap-2 text-sm text-text font-body">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  CISSP Certified Staff
                </div>
                <div className="flex items-center gap-2 text-sm text-text font-body">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  ISO 27001 Compliance
                </div>
                <div className="flex items-center gap-2 text-sm text-text font-body">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  24/7 SLA Guarantees
                </div>
              </div>
            </div>
            
            <div className="glass bg-[#030712]/50 border border-border/60 rounded-xl p-6 flex flex-col gap-4 font-body text-sm relative">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="font-bold font-display text-text flex items-center gap-2">
                  <PhoneCall size={16} className="text-primary animate-bounce" />
                  Emergency SLA Support
                </span>
                <span className="text-xs bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
              <p className="text-muted leading-relaxed">
                Critical servers offline? Office network down? Our emergency response team guarantees engineer dispatch or remote diagnostics within <strong>15 minutes</strong>.
              </p>
              <Button
                variant="cyber"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate("/book?type=emergency")}
              >
                Trigger Emergency Protocol
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
