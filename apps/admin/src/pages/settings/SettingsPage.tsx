import React, { useState } from "react";
import {
  Building2, Palette, Clock, DollarSign, Mail, MessageSquare,
  Users, Shield, Save, Check, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, Button, Input } from "@remotefix/ui";

// ── Local storage helpers ────────────────────────────────────────
function useSetting<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s !== null ? JSON.parse(s) : defaultValue;
    } catch { return defaultValue; }
  });
  const set = (v: T) => { setValue(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [value, set];
}

// ── Collapsible Section ──────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Card glowColor="none" className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-white/3 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-bold font-display text-text uppercase tracking-wider">
          {icon} {title}
        </span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/30 pt-4">{children}</div>}
    </Card>
  );
}

// ── Save Toast ───────────────────────────────────────────────────
function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <Button variant="cyber" size="sm" className="mt-4 flex items-center gap-2 text-xs" onClick={onClick}>
      {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
    </Button>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SettingsPage: React.FC = () => {
  // ── Company Profile ────────────────────────────────────────────
  const [companyName, setCompanyName] = useSetting("rf_company_name", "RemoteFix Inc.");
  const [companyGstin, setCompanyGstin] = useSetting("rf_company_gstin", "");
  const [companyAddress, setCompanyAddress] = useSetting("rf_company_address", "100 Tech Park Drive, New Delhi - 110020");
  const [companyPhone, setCompanyPhone] = useSetting("rf_company_phone", "+91-98765-43210");
  const [companyEmail, setCompanyEmail] = useSetting("rf_company_email", "support@remotefix.com");
  const [companySaved, setCompanySaved] = useState(false);

  // ── Branding ───────────────────────────────────────────────────
  const [logoUrl, setLogoUrl] = useSetting("rf_logo_url", "");
  const [primaryColor, setPrimaryColor] = useSetting("rf_primary_color", "#8B5CF6");
  const [accentColor, setAccentColor] = useSetting("rf_accent_color", "#06b6d4");
  const [brandSaved, setBrandSaved] = useState(false);

  // ── Business Hours ─────────────────────────────────────────────
  const defaultHours = DAYS.map(d => ({ day: d, open: d !== "Sunday", from: "09:00", to: "18:00" }));
  const [businessHours, setBusinessHours] = useSetting("rf_business_hours", defaultHours);
  const [hoursSaved, setHoursSaved] = useState(false);

  const updateHour = (idx: number, field: "open" | "from" | "to", value: any) => {
    const updated = [...businessHours] as any[];
    updated[idx] = { ...updated[idx], [field]: value };
    setBusinessHours(updated as any);
  };

  // ── Service Charges ────────────────────────────────────────────
  const [calloutFee, setCalloutFee] = useSetting("rf_callout_fee", "50.00");
  const [emergencySurcharge, setEmergencySurcharge] = useSetting("rf_emergency_surcharge", "25.00");
  const [gstRate, setGstRate] = useSetting("rf_gst_rate", "18");
  const [chargesSaved, setChargesSaved] = useState(false);

  // ── Email Config ───────────────────────────────────────────────
  const [smtpHost, setSmtpHost] = useSetting("rf_smtp_host", "");
  const [smtpPort, setSmtpPort] = useSetting("rf_smtp_port", "587");
  const [smtpUser, setSmtpUser] = useSetting("rf_smtp_user", "");
  const [smtpPass, setSmtpPass] = useSetting("rf_smtp_pass", "");
  const [smtpFromName, setSmtpFromName] = useSetting("rf_smtp_from_name", "RemoteFix Support");
  const [emailSaved, setEmailSaved] = useState(false);

  // ── SMS Config ─────────────────────────────────────────────────
  const [twilioSid, setTwilioSid] = useSetting("rf_twilio_sid", "");
  const [twilioToken, setTwilioToken] = useSetting("rf_twilio_token", "");
  const [twilioFrom, setTwilioFrom] = useSetting("rf_twilio_from", "");
  const [smsSaved, setSmsSaved] = useState(false);

  function flash(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  return (
    <div className="space-y-4 font-body max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-black font-display text-text">Platform Settings</h2>
        <p className="text-xs text-muted mt-1">Configure company profile, branding, hours, charges, and integrations.</p>
      </div>

      {/* Company Profile */}
      <Section icon={<Building2 size={15} className="text-secondary" />} title="Company Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" value={companyName as string} onChange={(e: any) => setCompanyName(e.target.value)} />
          <Input label="GSTIN Number" value={companyGstin as string} onChange={(e: any) => setCompanyGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" />
          <Input label="Support Email" type="email" value={companyEmail as string} onChange={(e: any) => setCompanyEmail(e.target.value)} />
          <Input label="Support Phone" value={companyPhone as string} onChange={(e: any) => setCompanyPhone(e.target.value)} />
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted font-display block mb-1">Registered Address</label>
            <textarea rows={2} value={companyAddress as string} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary resize-none" />
          </div>
        </div>
        <SaveButton saved={companySaved} onClick={() => flash(setCompanySaved)} />
      </Section>

      {/* Branding */}
      <Section icon={<Palette size={15} className="text-secondary" />} title="Branding & Appearance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Logo URL" value={logoUrl as string} onChange={(e: any) => setLogoUrl(e.target.value)} placeholder="https://yoursite.com/logo.png" />
          <div />
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor as string} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent" />
              <span className="text-xs text-muted font-mono">{primaryColor as string}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accentColor as string} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent" />
              <span className="text-xs text-muted font-mono">{accentColor as string}</span>
            </div>
          </div>
        </div>
        {(logoUrl as string) && (
          <div className="mt-3">
            <label className="text-[10px] text-muted uppercase font-semibold block mb-1">Logo Preview</label>
            <img src={logoUrl as string} alt="Logo preview" className="h-10 object-contain bg-white/5 rounded p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}
        <SaveButton saved={brandSaved} onClick={() => flash(setBrandSaved)} />
      </Section>

      {/* Business Hours */}
      <Section icon={<Clock size={15} className="text-secondary" />} title="Business Hours">
        <div className="flex flex-col gap-2">
          {(businessHours as any[]).map((h: any, i: number) => (
            <div key={h.day} className="flex items-center gap-3 text-xs">
              <span className="w-24 text-muted font-semibold shrink-0">{h.day}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={h.open} onChange={e => updateHour(i, "open", e.target.checked)} className="accent-purple-500" />
                <span className={h.open ? "text-text" : "text-muted"}>Open</span>
              </label>
              {h.open && (
                <>
                  <input type="time" value={h.from} onChange={e => updateHour(i, "from", e.target.value)} className="px-2 py-1 bg-[#111827]/60 border border-border text-text rounded outline-none text-xs" />
                  <span className="text-muted">to</span>
                  <input type="time" value={h.to} onChange={e => updateHour(i, "to", e.target.value)} className="px-2 py-1 bg-[#111827]/60 border border-border text-text rounded outline-none text-xs" />
                </>
              )}
              {!h.open && <span className="text-muted italic text-[10px]">Closed</span>}
            </div>
          ))}
        </div>
        <SaveButton saved={hoursSaved} onClick={() => flash(setHoursSaved)} />
      </Section>

      {/* Service Charges */}
      <Section icon={<DollarSign size={15} className="text-secondary" />} title="Service Charges & Tax">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Callout Fee (₹)</label>
            <input type="number" value={calloutFee as string} onChange={e => setCalloutFee(e.target.value)} className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Emergency Surcharge (₹)</label>
            <input type="number" value={emergencySurcharge as string} onChange={e => setEmergencySurcharge(e.target.value)} className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">GST Rate (%)</label>
            <input type="number" min="0" max="100" value={gstRate as string} onChange={e => setGstRate(e.target.value)} className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
          </div>
        </div>
        <div className="mt-3 bg-secondary/5 border border-secondary/20 rounded-lg p-3 text-[10px] text-muted">
          GST breakdown on invoices: <strong className="text-text">CGST {Math.round(parseFloat(gstRate as string) / 2)}%</strong> + <strong className="text-text">SGST {Math.round(parseFloat(gstRate as string) / 2)}%</strong> = <strong className="text-secondary">{gstRate}% Total</strong>
        </div>
        <SaveButton saved={chargesSaved} onClick={() => flash(setChargesSaved)} />
      </Section>

      {/* Email Config */}
      <Section icon={<Mail size={15} className="text-secondary" />} title="Email Configuration (SMTP)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="SMTP Host" value={smtpHost as string} onChange={(e: any) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
          <Input label="SMTP Port" value={smtpPort as string} onChange={(e: any) => setSmtpPort(e.target.value)} placeholder="587" />
          <Input label="Username / Email" value={smtpUser as string} onChange={(e: any) => setSmtpUser(e.target.value)} placeholder="no-reply@company.com" />
          <Input label="Password / App Key" type="password" value={smtpPass as string} onChange={(e: any) => setSmtpPass(e.target.value)} placeholder="••••••••" />
          <Input label="Sender Display Name" value={smtpFromName as string} onChange={(e: any) => setSmtpFromName(e.target.value)} placeholder="RemoteFix Support" />
        </div>
        <div className="mt-3 bg-[#111827]/60 border border-border/50 rounded-lg p-3 text-[10px] text-muted">
          Set <code className="text-primary">SMTP_HOST</code>, <code className="text-primary">SMTP_PORT</code>, <code className="text-primary">SMTP_USER</code>, <code className="text-primary">SMTP_PASS</code> in your Cloudflare Worker environment to activate live email dispatch.
        </div>
        <SaveButton saved={emailSaved} onClick={() => flash(setEmailSaved)} />
      </Section>

      {/* SMS Config */}
      <Section icon={<MessageSquare size={15} className="text-secondary" />} title="SMS Configuration (Twilio)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Twilio Account SID" value={twilioSid as string} onChange={(e: any) => setTwilioSid(e.target.value)} placeholder="ACxxxxxxxxxxxxxxxx" />
          <Input label="Twilio Auth Token" type="password" value={twilioToken as string} onChange={(e: any) => setTwilioToken(e.target.value)} placeholder="••••••••" />
          <Input label="Twilio Sender Number" value={twilioFrom as string} onChange={(e: any) => setTwilioFrom(e.target.value)} placeholder="+12345678901" />
        </div>
        <SaveButton saved={smsSaved} onClick={() => flash(setSmsSaved)} />
      </Section>

      {/* Users & Roles */}
      <Section icon={<Shield size={15} className="text-secondary" />} title="Users, Roles & Permissions">
        <div className="space-y-3 text-xs">
          <div className="bg-[#111827]/40 border border-border/50 rounded-xl p-4">
            <h4 className="text-text font-bold font-display mb-3 uppercase tracking-wider text-[10px]">Role Definitions</h4>
            <div className="flex flex-col gap-3">
              {[
                { role: "admin", color: "text-danger", label: "Administrator", perms: ["All permissions — full system access, billing, user management"] },
                { role: "engineer", color: "text-warning", label: "Technician / Engineer", perms: ["View assigned bookings", "Update job status", "Upload photos & remarks", "View own performance"] },
                { role: "customer", color: "text-cyan-400", label: "Customer (Portal)", perms: ["View own bookings", "Download own invoices", "Update profile", "Track service status"] },
              ].map(r => (
                <div key={r.role} className="flex items-start gap-3 p-3 bg-[#0a0f1a]/60 rounded-lg border border-border/30">
                  <code className={`text-[10px] font-mono font-bold ${r.color} bg-current/10 px-2 py-0.5 rounded shrink-0`} style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>{r.role}</code>
                  <div>
                    <div className="font-semibold text-text mb-0.5">{r.label}</div>
                    {r.perms.map((p, i) => <div key={i} className="text-muted text-[10px] flex items-center gap-1"><span className="text-success">✓</span> {p}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-[10px] text-muted leading-relaxed">
            <span className="text-text font-bold block mb-1">🔐 Role Assignment</span>
            Roles are assigned via the <strong className="text-text">Technician Management → Register New Technician</strong> workflow. Customer roles are auto-assigned on portal registration. Admin promotion requires direct database modification for security.
          </div>
        </div>
      </Section>
    </div>
  );
};
