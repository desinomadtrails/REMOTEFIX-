import React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Ticket, Home, Eye } from "lucide-react";
import { Button, Card } from "@remotefix/ui";

export const BookSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId") || "RF-20260727-000000";

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <Card className="text-center p-8 md:p-12 flex flex-col items-center gap-6" glowColor="cyan">
        <div className="p-4 bg-success/10 rounded-full border border-success/20 text-success">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        
        <div>
          <h1 className="text-3xl font-black font-display text-text">Request Submitted!</h1>
          <p className="text-sm text-muted font-body mt-2 max-w-md mx-auto leading-relaxed">
            Your IT support request has been registered in our system. You do not need to log in to track your service request.
          </p>
        </div>

        {/* Ticket ID Box */}
        <div className="bg-[#111827]/40 border border-[#374151]/50 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-2">
          <span className="text-xs text-muted font-body uppercase tracking-wider">Your Unique Ticket ID</span>
          <span className="text-2xl font-black font-display text-primary tracking-wide select-all">
            {ticketId}
          </span>
          <span className="text-[10px] text-muted font-body mt-1 text-center">
            Save this Ticket ID to track the real-time status of your device.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
          <Button
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => navigate("/track")}
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
