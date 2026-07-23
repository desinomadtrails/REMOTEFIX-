import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router";
import { Check, ShieldCheck } from "lucide-react";
import { Button, Card, GlowDivider } from "@remotefix/ui";
export const Pricing = () => {
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
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-black font-display text-text", children: "Transparent Cyber Pricing" }), _jsx("p", { className: "text-muted font-body mt-4 max-w-lg mx-auto leading-relaxed", children: "Choose a one-off support incident package or outsourcing agreement. No hidden service call fees." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mb-16", children: plans.map((plan, idx) => (_jsxs(Card, { glowColor: plan.highlighted ? "purple" : "cyan", className: `flex flex-col relative ${plan.highlighted ? "border-[#8B5CF6]/50 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-[#111827]/90" : ""}`, children: [plan.highlighted && (_jsx("span", { className: "absolute -top-3.5 right-6 bg-secondary text-white font-display text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(139,92,246,0.4)]", children: "Most Popular" })), _jsx("h3", { className: "text-xl font-bold font-display text-text", children: plan.name }), _jsx("p", { className: "text-xs text-muted font-body mt-1 h-8", children: plan.desc }), _jsxs("div", { className: "my-6", children: [_jsx("span", { className: "text-4xl sm:text-5xl font-black font-display text-text", children: plan.price }), _jsxs("span", { className: "text-sm text-muted font-body ml-2", children: ["/ ", plan.period] })] }), _jsx(GlowDivider, { color: plan.highlighted ? "purple" : "cyan", className: "my-2" }), _jsx("ul", { className: "space-y-3.5 my-6 flex-grow font-body text-sm text-muted", children: plan.features.map((feat, fidx) => (_jsxs("li", { className: "flex items-start gap-2.5", children: [_jsx(Check, { size: 16, className: plan.highlighted ? "text-secondary mt-0.5" : "text-primary mt-0.5" }), _jsx("span", { children: feat })] }, fidx))) }), _jsx(Button, { variant: plan.highlighted ? "primary" : "cyber", glow: plan.highlighted, className: "w-full mt-auto", style: plan.highlighted ? { backgroundColor: "#8B5CF6", color: "white" } : {}, onClick: () => navigate(`/book?type=${plan.type}`), children: plan.cta })] }, idx))) }), _jsxs("div", { className: "glass bg-[#111827]/40 border border-border/80 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "p-3 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 rounded-xl", children: _jsx(ShieldCheck, { size: 28 }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-bold font-display text-text", children: "100% Satisfaction Service SLA Guarantee" }), _jsx("p", { className: "text-sm text-muted font-body mt-1 max-w-xl", children: "If our engineers cannot resolve the problem described in your booking request, your diagnostic fee is refunded immediately. No questions asked." })] })] }), _jsx(Button, { variant: "outline", onClick: () => navigate("/contact"), children: "Read Service Terms" })] })] }));
};
//# sourceMappingURL=Pricing.js.map