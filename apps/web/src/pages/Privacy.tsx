import React from "react";
import { Shield } from "lucide-react";
import { Card } from "@remotefix/ui";

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-body">
      <Card glowColor="cyan" className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-black font-display text-text">Privacy Policy</h1>
        </div>
        
        <div className="text-muted leading-relaxed space-y-6 text-sm">
          <p>At RemoteFix, we respect your data and credentials. This privacy policy describes how we collect, process, and protect information when you book remote diagnostics or request physical on-site visits.</p>
          
          <h2 className="text-xl font-bold font-display text-text mt-6">1. Remote Desktop Session Security</h2>
          <p>All remote diagnostics sessions are client-initiated. Session data is encrypted in transit using 256-bit AES mechanisms. Our technicians cannot establish connection loops without you entering active session codes. We do not store remote access logs beyond session termination.</p>
          
          <h2 className="text-xl font-bold font-display text-text mt-6">2. Database Records</h2>
          <p>Your name, email address, company coordinates, and diagnostic records are stored on secure Azure SQL Database clusters. Financial transactions (invoices and credit card numbers) are processed through encrypted payment pathways; we do not store CVV digits or full card details in our database logs.</p>

          <h2 className="text-xl font-bold font-display text-text mt-6">3. Data Retention</h2>
          <p>We retain support tickets and audit log logs to comply with tax rules and technical warranties. You can request deletion of your coordinates by contacting our DPO team at privacy@remotefix.com.</p>
        </div>
      </Card>
    </div>
  );
};
