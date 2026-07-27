import React from "react";
import { Shield, Users, Heart, Award, ArrowRight } from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { useNavigate } from "react-router";

export const About: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Security First",
      desc: "All remote sessions are fully encrypted using client-initiated 256-bit AES protocols. Your infrastructure credentials remain secure.",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Certified Engineers",
      desc: "Every team member holds active industry-standard certifications including CISSP, CCNA, and Microsoft 365 Enterprise Administrator.",
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Zero-Friction Access",
      desc: "We believe in instant utility. Customers request assistance as a guest and track status milestones without sign-up constraints.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 font-body">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Award className="w-3.5 h-3.5" />
          Who We Are
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Redefining IT Systems Support
        </h1>
        <p className="text-muted mt-4 max-w-2xl mx-auto leading-relaxed text-sm">
          RemoteFix was founded to solve enterprise IT problems instantly. We merge secure cloud-native remote diagnostics with dedicated on-site engineer dispatches.
        </p>
      </div>

      {/* Story Card */}
      <Card className="p-8 md:p-12 mb-16 relative overflow-hidden" glowColor="cyan">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-md" />
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold font-display text-text mb-4">Our Core Philosophy</h2>
          <p className="text-muted leading-relaxed text-sm mb-6">
            Historically, getting high-quality IT support required signing complex, multi-year outsourcing contracts or waiting on hold for hours. RemoteFix transforms this by operating on a zero-friction, catalog-based checkout system. Need a router configured, server migrated, or virus removed? Book it as a guest, receive a Ticket ID, and track progress real-time.
          </p>
          <Button variant="primary" onClick={() => navigate("/book")} glow className="flex items-center gap-2">
            Experience Our Flow
            <ArrowRight size={16} />
          </Button>
        </div>
      </Card>

      <GlowDivider color="gradient" className="my-12" />

      {/* Core Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold font-display text-text text-center mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <Card key={idx} className="flex flex-col gap-4 p-6" glowColor="none">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 self-start">
                {val.icon}
              </div>
              <h3 className="text-lg font-bold font-display text-text">{val.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{val.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold font-display text-text mb-4">Elite Technical Leadership</h2>
        <p className="text-muted max-w-md mx-auto text-xs mb-12">
          Backed by network architects and systems engineers with decades of combined experience.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <Card className="flex flex-col items-center gap-4 text-center p-6" glowColor="none">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-2xl text-primary font-display">
              AH
            </div>
            <div>
              <h4 className="text-base font-bold text-text">Alexander Hayes</h4>
              <span className="text-xs text-muted">Chief Technology Officer</span>
            </div>
          </Card>

          <Card className="flex flex-col items-center gap-4 text-center p-6" glowColor="none">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-2xl text-primary font-display">
              MK
            </div>
            <div>
              <h4 className="text-base font-bold text-text">Marcus Kincaid</h4>
              <span className="text-xs text-muted">Lead Systems Architect</span>
            </div>
          </Card>

          <Card className="flex flex-col items-center gap-4 text-center p-6" glowColor="none">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-2xl text-primary font-display">
              SL
            </div>
            <div>
              <h4 className="text-base font-bold text-text">Sophia Loomis</h4>
              <span className="text-xs text-muted">Principal Security Engineer</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
