import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Heart, 
  Award, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Linkedin,
  Server,
  Terminal,
  Activity,
  Sparkles
} from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { AuroraBackground } from "../components/AuroraBackground.js";
import { SEO } from "../components/SEO.js";

// Animated counter component
const CounterStat: React.FC<{ value: number; suffix?: string; label: string; icon: React.ReactNode }> = ({
  value,
  suffix = "",
  label,
  icon,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center" glowColor="cyan">
      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary mb-3">
        {icon}
      </div>
      <div className="text-3xl sm:text-4xl font-black font-display text-text">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-muted font-body font-semibold uppercase tracking-wider mt-1">
        {label}
      </div>
    </Card>
  );
};

export const About: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: "Security First Architecture",
      desc: "All remote operations execute inside client-authorized AES-256 encrypted tunnels. Zero unauthorized background persistence.",
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Certified Systems Engineers",
      desc: "Every technician holds active Cisco CCNA/CCNP, Microsoft 365, CISSP, or CompTIA Security+ certifications.",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Zero Friction SLA",
      desc: "Account creation is strictly optional. Initiate diagnostics instantly as a guest, receive a trackable Ticket ID, and track live milestones.",
    },
    {
      icon: <Activity className="w-6 h-6 text-primary" />,
      title: "24/7 Active Monitoring",
      desc: "Our automated cloud telemetry monitors network nodes and server health around the clock with rapid emergency dispatch.",
    },
  ];

  const team = [
    {
      name: "Alexander Hayes",
      role: "Chief Technology Officer",
      bio: "Ex-Cisco Systems Architect with 15+ years engineering high-availability corporate cloud backbones.",
      initials: "AH",
      color: "from-cyan-500 to-blue-600",
    },
    {
      name: "Marcus Kincaid",
      role: "Lead Systems Architect",
      bio: "Specializes in Azure SQL database design, zero-trust network topologies, and automated failovers.",
      initials: "MK",
      color: "from-purple-500 to-indigo-600",
    },
    {
      name: "Sophia Loomis",
      role: "Principal Security Engineer",
      bio: "Former Threat Intelligence Analyst specializing in malware isolation, endpoint defense, and penetration testing.",
      initials: "SL",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "David Vance",
      role: "Field Operations Director",
      bio: "Oversees physical hardware dispatches, datacenter rack installations, and local technician dispatching.",
      initials: "DV",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "Elena Rostova",
      role: "Client Success Manager",
      bio: "Ensures seamless onboarding for enterprise SLA contracts, AMC accounts, and corporate IT migrations.",
      initials: "ER",
      color: "from-pink-500 to-rose-600",
    },
    {
      name: "Rahul Sharma",
      role: "DevOps & Infrastructure Lead",
      bio: "Maintains our Hono microservice gateways, Cloudflare Workers routing, and 99.99% system uptime.",
      initials: "RS",
      color: "from-cyan-400 to-purple-600",
    },
  ];

  const milestones = [
    { year: "2018", title: "RemoteFix Founded", desc: "Started as a regional remote IT diagnostics provider with 3 systems engineers." },
    { year: "2020", title: "Guest Booking Protocol", desc: "Launched zero-login ticket generation system allowing instant dispatch without registration." },
    { year: "2022", title: "Azure SQL Integration", desc: "Migrated to enterprise cloud infrastructure with automated job tracking and real-time status updates." },
    { year: "2024", title: "AMC & Emergency SLAs", desc: "Expanded to offer guaranteed 15-minute emergency SLA dispatches and corporate hardware contracts." },
    { year: "2026", title: "Nationwide Coverage", desc: "Over 5,000+ corporate endpoints managed with 98%+ first-contact issue resolution rate." },
  ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 overflow-hidden">
      <SEO
        title="About Us | RemoteFix IT Services Platform"
        description="Learn about RemoteFix, our certified IT systems engineers, our zero-friction guest booking philosophy, and security-first infrastructure."
        canonicalUrl="https://remotefix.com/about"
      />
      
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-body">
        
        {/* HERO SECTION */}
        <div className="text-center pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Engineering Excellence &amp; Zero Friction
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black font-display tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Redefining Enterprise <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              IT Systems Support
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted font-body max-w-2xl mx-auto leading-relaxed"
          >
            RemoteFix merges encrypted remote desktop diagnostics with rapid on-site technician dispatches into a single seamless platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
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
              onClick={() => navigate("/pricing")}
            >
              View Pricing Tiers
            </Button>
          </motion.div>
        </div>

        <GlowDivider color="gradient" />

        {/* STATS COUNTER ROW */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CounterStat value={8} suffix="+" label="Years Active" icon={<Clock className="w-6 h-6" />} />
            <CounterStat value={5000} suffix="+" label="Satisfied Clients" icon={<Users className="w-6 h-6" />} />
            <CounterStat value={98} suffix="%" label="Resolution Rate" icon={<CheckCircle2 className="w-6 h-6" />} />
            <CounterStat value={24} suffix="/7" label="Active Support" icon={<Activity className="w-6 h-6" />} />
          </div>
        </div>

        {/* OUR STORY SECTION */}
        <div className="py-16">
          <Card className="p-8 md:p-12 relative overflow-hidden" glowColor="cyan">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <span className="text-xs font-semibold text-primary uppercase font-display tracking-wider">Our Origin Story</span>
                <h2 className="text-3xl font-bold font-display text-text">Built to Eliminate IT Bottlenecks</h2>
                <p className="text-sm text-muted leading-relaxed font-body">
                  Historically, obtaining enterprise-level IT assistance meant dealing with tedious sign-up forms, rigid long-term contracts, or sitting on hold for hours. RemoteFix was architected to eliminate every barrier between a system failure and a certified technician.
                </p>
                <p className="text-sm text-muted leading-relaxed font-body">
                  Whether a small business router crashes or a corporate workstation suffers malware contamination, users can book an on-site visit or remote session instantly as a guest, receive a trackable Ticket ID, and track live dispatch milestones.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text">
                    <CheckCircle2 size={16} className="text-primary" /> 100% Encrypted Sessions
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-text">
                    <CheckCircle2 size={16} className="text-primary" /> Transparent Pricing
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square bg-[#111827]/60 border border-border/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                    <Server size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-display text-text">Cloud &amp; On-Site Hybrid</h3>
                    <p className="text-xs text-muted">Integrated with Azure SQL &amp; Hono microservices for real-time tracking.</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    <Terminal size={12} /> STATUS: ONLINE
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <GlowDivider color="cyan" />

        {/* CORE VALUES */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-text">Our Operating Principles</h2>
            <p className="text-muted font-body mt-2 max-w-md mx-auto text-sm">
              The fundamental standards guiding our service delivery and client relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <Card key={idx} className="flex flex-col gap-4 p-6 hover:-translate-y-1 transition-transform" glowColor="cyan">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 self-start">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold font-display text-text">{val.title}</h3>
                <p className="text-xs text-muted leading-relaxed font-body">{val.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <GlowDivider color="gradient" />

        {/* TIMELINE */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-text">Company Growth Milestones</h2>
            <p className="text-muted font-body mt-2 max-w-md mx-auto text-sm">
              From regional tech service to nationwide corporate IT dispatch network.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="w-20 shrink-0 text-right font-display font-black text-xl text-primary pt-1">
                  {m.year}
                </div>
                <div className="relative pl-6 border-l-2 border-primary/30 pb-2">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#030712] border-2 border-primary" />
                  <h3 className="text-base font-bold font-display text-text">{m.title}</h3>
                  <p className="text-xs text-muted leading-relaxed mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GlowDivider color="cyan" />

        {/* MEET THE TEAM */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-text">Meet Our Engineering Team</h2>
            <p className="text-muted font-body mt-2 max-w-md mx-auto text-sm">
              Led by veteran systems architects, cybersecurity analysts, and network directors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((t, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-6" glowColor="none">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-2xl text-white font-display shadow-lg mb-4`}>
                  {t.initials}
                </div>
                <h3 className="text-base font-bold font-display text-text">{t.name}</h3>
                <span className="text-xs text-primary font-semibold font-display mt-0.5">{t.role}</span>
                <p className="text-xs text-muted leading-relaxed font-body mt-3">{t.bio}</p>
                <button
                  onClick={() => alert(`Connecting with ${t.name} on LinkedIn...`)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  <Linkedin size={14} /> Profile
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="py-12">
          <Card className="p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/30" glowColor="cyan">
            <h2 className="text-3xl font-black font-display text-text">Ready to Fix Your IT Infrastructure?</h2>
            <p className="text-sm text-muted font-body max-w-lg mx-auto mt-3">
              Book a service request as a guest in under 2 minutes. No credit card or registration required upfront.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Button variant="primary" size="lg" glow onClick={() => navigate("/book")}>
                Launch Booking Wizard
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
