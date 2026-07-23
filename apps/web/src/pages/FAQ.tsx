import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card } from "@remotefix/ui";

const FAQS = [
  {
    q: "How secure is remote support? Can you access my computer without my permission?",
    a: "Our remote sessions are fully client-initiated and highly secure. We use TLS 1.3 encryption, and you must explicitly download and execute the temporary session host client. Once the session ends and the client is closed, we cannot reconnect or access your systems without you launching the program and sharing a new code.",
  },
  {
    q: "What happens if an issue cannot be fixed remotely?",
    a: "If our engineer determines that the diagnostic issues are hardware-related (e.g. faulty motherboard, dead HDD, or physical router ports) and cannot be fixed remotely, we will immediately deduct the remote diagnostics fee and offer to dispatch an on-site engineer or arrange a hardware swap.",
  },
  {
    q: "What is your typical turnaround time for on-site dispatches?",
    a: "For standard on-site visits, scheduling is typically coordinated within 24 to 48 hours depending on parts availability. For emergency SLA bookings, we guarantee dispatch of an engineer within 15 minutes of payment approval.",
  },
  {
    q: "Do you supply parts for hardware upgrades?",
    a: "Yes, we source enterprise-grade storage disks, network routers, CCTV hardware, and server rack accessories directly from authorized distributors. All hardware components we deploy come with a full manufacturer warranty plus our 30-day labor warranty.",
  },
  {
    q: "Can I cancel or reschedule a service booking?",
    a: "Yes, you can cancel or reschedule bookings through the Customer Dashboard up to 12 hours before the scheduled timeframe. Cancellations made inside the 12-hour window might incur a minor diagnostic callout fee depending on the service class.",
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black font-display text-text">
          Help Desk & FAQs
        </h1>
        <p className="text-muted font-body mt-4 max-w-md mx-auto leading-relaxed">
          Common answers regarding RemoteFix operations, billing rules, and remote connectivity standards.
        </p>
      </div>

      {/* Accordions */}
      <div className="flex flex-col gap-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card
              key={idx}
              glowColor={isOpen ? "cyan" : "none"}
              className="cursor-pointer select-none p-5 transition-all duration-300"
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex justify-between items-start gap-4">
                <span className="font-display font-bold text-base sm:text-lg text-text flex gap-3 items-start">
                  <HelpCircle className="w-5.5 h-5.5 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </span>
                <span className="text-muted mt-1">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </div>

              {isOpen && (
                <div className="mt-4 pl-8 border-t border-border/40 pt-4 text-sm text-muted font-body leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
