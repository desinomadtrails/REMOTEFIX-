import React from "react";
import { useNavigate } from "react-router";
import { Check, ShieldCheck, Tag } from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Remote Fix",
      price: "$79",
      period: "per incident",
      desc: "Perfect for fast diagnostic repairs, malware cleanup, and email configurations.",
      features: [
        "1 Hour remote diagnostic session",
        "Encrypted screen-sharing link",
        "Virus & adware scan/removal",
        "Software updates & patches",
        "7-Day service guarantee",
      ],
      cta: "Book Remote Support",
      type: "remote",
    },
    {
      name: "SLA Emergency",
      price: "$199",
      period: "per incident",
      desc: "Priority dispatch for server crashes, total office network blackouts, or database corruption.",
      features: [
        "15-Minute response SLA",
        "Direct line to Lead Engineer",
        "Remote restore or On-site dispatch",
        "Security audit check",
        "Post-mortem report analysis",
      ],
      cta: "Trigger SLA Support",
      type: "emergency",
      highlighted: true,
    },
    {
      name: "AMC Corporate",
      price: "$499",
      period: "per month",
      desc: "Full outsourcing. Active network monitoring, storage maintenance, and backup validations.",
      features: [
        "Up to 10 endpoints supported",
        "Scheduled monthly on-site checkups",
        "Automated NAS & Cloud backups",
        "CCTV & Firewall configurations",
        "Next-business-day hardware swaps",
      ],
      cta: "Inquire Corporate AMC",
      type: "amc",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-body">
      <SEO
        title="Transparent Pricing & SLA Tiers | RemoteFix"
        description="Clear, upfront pricing for remote IT repairs, emergency SLA dispatches, and corporate AMC contracts. No hidden callout fees."
        canonicalUrl="https://remotefix.com/pricing"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-4 font-display">
          <Tag className="w-3.5 h-3.5" />
          No Hidden Fees
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Transparent Cyber Pricing
        </h1>
        <p className="text-muted font-body mt-4 max-w-lg mx-auto leading-relaxed text-sm">
          Choose a one-off support incident package or full corporate outsourcing. Guest checkout available.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            glowColor={plan.highlighted ? "purple" : "cyan"}
            className={`flex flex-col relative ${
              plan.highlighted ? "border-[#8B5CF6]/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-[#111827]/90" : ""
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3.5 right-6 bg-secondary text-white font-display text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.4)]">
                Most Popular
              </span>
            )}

            {/* Plan Info */}
            <h3 className="text-xl font-bold font-display text-text">{plan.name}</h3>
            <p className="text-xs text-muted font-body mt-1 h-8">{plan.desc}</p>

            {/* Price */}
            <div className="my-6">
              <span className="text-4xl sm:text-5xl font-black font-display text-text">
                {plan.price}
              </span>
              <span className="text-sm text-muted font-body ml-2">/ {plan.period}</span>
            </div>

            <GlowDivider color={plan.highlighted ? "purple" : "cyan"} className="my-2" />

            {/* Features */}
            <ul className="space-y-3.5 my-6 flex-grow font-body text-xs text-muted">
              {plan.features.map((feat, fidx) => (
                <li key={fidx} className="flex items-start gap-2.5">
                  <Check size={16} className={plan.highlighted ? "text-secondary mt-0.5 shrink-0" : "text-primary mt-0.5 shrink-0"} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant={plan.highlighted ? "primary" : "cyber"}
              glow={plan.highlighted}
              className="w-full mt-auto"
              style={plan.highlighted ? { backgroundColor: "#8B5CF6", color: "white" } : {}}
              onClick={() => navigate(`/book?type=${plan.type}`)}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      {/* Security Assurance */}
      <div className="bg-[#111827]/40 border border-border/80 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 rounded-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold font-display text-text">100% Satisfaction Service SLA Guarantee</h4>
            <p className="text-xs text-muted font-body mt-1 max-w-xl leading-relaxed">
              If our engineers cannot resolve the problem described in your booking request, your diagnostic fee is refunded immediately. No questions asked.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/contact")}>
          Read Service Terms
        </Button>
      </div>
    </div>
  );
};
