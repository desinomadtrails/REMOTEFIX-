import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Ticket, Home, Eye, Copy, Check } from "lucide-react";
import { Button, Card } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const BookSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId") || "RF-20260728-000000";
  const phone = searchParams.get("phone") || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 font-body">
      <SEO
        title="Service Request Confirmed | RemoteFix"
        description="Your service request has been successfully registered. Save your Ticket ID to track real-time progress."
      />

      <Card className="text-center p-8 md:p-12 flex flex-col items-center gap-6" glowColor="cyan">
        <div className="p-4 bg-success/10 rounded-full border border-success/20 text-success">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black font-display text-text">Request Submitted!</h1>
          <p className="text-xs text-muted font-body mt-2 max-w-md mx-auto leading-relaxed">
            Your IT support request has been registered in Azure SQL. Customer login is not mandatory to track your service status.
          </p>
        </div>

        {/* Ticket ID Box */}
        <div className="bg-[#111827]/60 border border-[#374151]/50 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted font-body uppercase tracking-wider font-semibold">Your Unique Ticket ID</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-display text-primary tracking-wide select-all">
              {ticketId}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              title="Copy Ticket ID"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <span className="text-[10px] text-muted font-body mt-1 text-center">
            Save this Ticket ID to track the real-time status of your device.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
          <Button
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => navigate(`/track?ticketId=${ticketId}&phone=${encodeURIComponent(phone)}`)}
            glow
          >
            <Eye size={16} />
            Track Request
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => navigate("/")}
          >
            <Home size={16} />
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
