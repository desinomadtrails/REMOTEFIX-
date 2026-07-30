import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Eye, Copy, Check, Home, Key, Mail, Sparkles } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const BookSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId") || "RF-20260728-000000";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const [copied, setCopied] = useState(false);

  // Optional Magic Link State
  const [magicEmail, setMagicEmail] = useState(email);
  const [magicSent, setMagicSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail) return;

    try {
      const res = await fetch("/api/customer/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setMagicSent(true);
        if (data.demoOtp) setDemoCode(data.demoOtp);
        setOtpMessage("Verification OTP dispatched! Check your email inbox.");
      }
    } catch (err) {
      setOtpMessage("Failed to dispatch magic link.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpMessage(`Account verified! Linked ${data.tickets?.length || 1} prior ticket(s).`);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setOtpMessage(data.error || "Invalid code.");
      }
    } catch (err) {
      setOtpMessage("Verification failed.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 font-body">
      <SEO
        title="Service Request Confirmed | RemoteFix"
        description="Your service request has been successfully registered. Save your Ticket ID to track real-time progress without an account."
      />

      <Card className="text-center p-8 md:p-12 flex flex-col items-center gap-6" glowColor="cyan">
        <div className="p-4 bg-success/10 rounded-full border border-success/20 text-success">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black font-display text-text">Request Submitted!</h1>
          <p className="text-xs text-muted font-body mt-2 max-w-md mx-auto leading-relaxed">
            Your IT support request has been registered in Azure SQL. Account creation is completely optional.
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
            Save this Ticket ID or direct secure tracking link to monitor live updates.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
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

        {/* Optional Account Creation Card */}
        <div className="mt-8 border-t border-border/40 pt-6 w-full text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold font-display text-text">Optional: Save Devices & View History</h3>
          </div>
          <p className="text-xs text-muted font-body mb-4">
            Convert to a free passwordless profile via Email Magic Link to automatically link all current and future tickets.
          </p>

          {!magicSent ? (
            <form onSubmit={handleSendMagicLink} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email for magic link..."
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button variant="outline" type="submit" className="whitespace-nowrap flex items-center gap-1.5">
                <Mail size={14} />
                Send Magic Link
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {demoCode && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary font-mono">
                  [DEMO TEST OTP]: <strong>{demoCode}</strong>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP code..."
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" type="button" onClick={handleVerifyOtp} className="flex items-center gap-1.5">
                  <Key size={14} />
                  Verify OTP
                </Button>
              </div>
            </div>
          )}

          {otpMessage && (
            <span className="text-[11px] font-semibold text-primary block mt-2">{otpMessage}</span>
          )}
        </div>
      </Card>
    </div>
  );
};
