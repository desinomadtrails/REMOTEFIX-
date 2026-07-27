import React from "react";
import { FileText } from "lucide-react";
import { Card } from "@remotefix/ui";

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-body">
      <Card glowColor="cyan" className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <FileText size={24} />
          </div>
          <h1 className="text-3xl font-black font-display text-text">Terms of Service</h1>
        </div>

        <div className="text-muted leading-relaxed space-y-6 text-sm">
          <p>By requesting remote assistance or scheduling on-site engineer dispatches, you agree to the following Service Terms of Service.</p>
          
          <h2 className="text-xl font-bold font-display text-text mt-6">1. Diagnostic Authorization</h2>
          <p>You authorize RemoteFix technicians to perform software diagnostics, install patch updates, and audit local network settings. You agree to maintain a complete system backup before launching remote sessions. RemoteFix is not liable for data loss caused by pre-existing hardware failures.</p>
          
          <h2 className="text-xl font-bold font-display text-text mt-6">2. SLA Guarantee & Refunds</h2>
          <p>If our technicians verify that the system issues described in your booking request cannot be resolved remotely (and you decide not to proceed with physical on-site visits), your diagnostic fee will be refunded immediately.</p>

          <h2 className="text-xl font-bold font-display text-text mt-6">3. Liability Limitations</h2>
          <p>RemoteFix is not responsible for business delays, data restoration costs, or physical damages resulting from third-party software patches or client infrastructure shutdowns.</p>
        </div>
      </Card>
    </div>
  );
};
