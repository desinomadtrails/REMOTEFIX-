import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Palette, Clock, DollarSign, Mail, MessageSquare,
  Users, Shield, Save, Check, ChevronDown, ChevronUp, Lock, Key, Plus, Globe, CheckCircle2
} from "lucide-react";
import { Card, Button, Input, Modal, Select, Badge } from "@remotefix/ui";
import { api } from "../../api.js";

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
    <Card glowColor="none" className="p-0 overflow-hidden font-body">
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

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // ── Company Profile ────────────────────────────────────────────
  const [companyName, setCompanyName] = useSetting("rf_company_name", "RemoteFix Inc.");
  const [companyGstin, setCompanyGstin] = useSetting("rf_company_gstin", "");
  const [companyAddress, setCompanyAddress] = useSetting("rf_company_address", "100 Tech Park Drive, New Delhi - 110020");
  const [companyPhone, setCompanyPhone] = useSetting("rf_company_phone", "+91-98765-43210");
  const [companyEmail, setCompanyEmail] = useSetting("rf_company_email", "support@remotefix.com");
  const [companySaved, setCompanySaved] = useState(false);

  // ── SSO Provider Form State ─────────────────────────────────────
  const [ssoModalOpen, setSsoModalOpen] = useState(false);
  const [ssoType, setSsoType] = useState<"okta" | "azure_ad" | "google_workspace" | "custom_saml">("okta");
  const [ssoIssuer, setSsoIssuer] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [ssoCert, setSsoCert] = useState("");

  const { data: ssoData = [] } = useQuery({
    queryKey: ["admin-sso-providers"],
    queryFn: async () => {
      const res = await api.getSsoProviders();
      return res.providers || [];
    },
  });

  const createSsoMutation = useMutation({
    mutationFn: (data: any) => api.createSsoProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sso-providers"] });
      setSsoModalOpen(false);
      setSsoIssuer("");
      setSsoUrl("");
      setSsoDomain("");
    },
    onError: (err: any) => alert(err.message),
  });

  const saveCompany = () => { setCompanySaved(true); setTimeout(() => setCompanySaved(false), 2000); };

  const handleCreateSso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoIssuer || !ssoUrl) return;
    createSsoMutation.mutate({
      providerType: ssoType,
      issuerUrl: ssoIssuer,
      ssoUrl: ssoUrl,
      domain: ssoDomain || undefined,
      certificatePem: ssoCert || undefined,
    });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-display text-text">Platform Settings &amp; Enterprise SSO</h1>
          <p className="text-xs text-muted mt-0.5">Manage company profile, GST billing options, and SAML 2.0 / Okta Single Sign-On providers.</p>
        </div>
      </div>

      {/* ENTERPRISE SSO CONFIGURATION SECTION */}
      <Section icon={<Lock size={16} className="text-primary" />} title="Enterprise SSO &amp; Identity Providers (SAML 2.0 / Okta / Azure AD)">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted max-w-xl">
              Enable corporate Single Sign-On (SSO) for Okta, Azure AD (Microsoft Entra ID), or Google Workspace to enforce enterprise SAML authentication.
            </p>
            <Button variant="primary" glow size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setSsoModalOpen(true)}>
              <Plus size={14} /> Configure IdP Provider
            </Button>
          </div>

          {ssoData.length === 0 ? (
            <div className="p-6 bg-black/20 border border-border/40 rounded-xl text-center text-xs text-muted">
              <Shield size={32} className="mx-auto mb-2 text-muted/30" />
              <span>No SSO Identity Providers configured. Click <strong>Configure IdP Provider</strong> to onboard Okta or Azure AD.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ssoData.map((sso: any) => (
                <Card key={sso.id} glowColor="cyan" className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text uppercase font-display flex items-center gap-1.5">
                      <Globe size={14} className="text-primary" /> {sso.providerType.replace("_", " ")}
                    </span>
                    <Badge variant={sso.isEnabled ? "success" : "danger"} className="text-[9px] uppercase">
                      {sso.isEnabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted font-mono space-y-1 bg-black/30 p-2.5 rounded-lg border border-border/30">
                    <div>Issuer: <span className="text-text">{sso.issuerUrl}</span></div>
                    <div>SSO Endpoint: <span className="text-primary">{sso.ssoUrl}</span></div>
                    {sso.domain && <div>Domain Scoped: <span className="text-success font-semibold">@{sso.domain}</span></div>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* COMPANY PROFILE SECTION */}
      <Section icon={<Building2 size={16} className="text-primary" />} title="Company &amp; GST Billing Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body">
          <Input label="Company Legal Name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          <Input label="GSTIN Tax ID (15 digits)" value={companyGstin} onChange={e => setCompanyGstin(e.target.value)} placeholder="27AAAAA0000A1Z5" />
          <Input label="Support Email Address" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
          <Input label="Support Helpline Phone" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Corporate Address" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} />
          </div>
        </div>
        <SaveButton onClick={saveCompany} saved={companySaved} />
      </Section>

      {/* CONFIGURE SSO MODAL */}
      <Modal isOpen={ssoModalOpen} onClose={() => setSsoModalOpen(false)} title="Configure Enterprise Identity Provider (SSO)">
        <form onSubmit={handleCreateSso} className="space-y-4 font-body">
          <Select
            label="Identity Provider Type"
            options={[
              { value: "okta", label: "Okta Single Sign-On" },
              { value: "azure_ad", label: "Microsoft Azure AD / Entra ID" },
              { value: "google_workspace", label: "Google Workspace SAML" },
              { value: "custom_saml", label: "Custom SAML 2.0 Provider" },
            ]}
            value={ssoType}
            onChange={(e: any) => setSsoType(e.target.value)}
          />

          <Input label="Issuer URL (Entity ID) *" placeholder="https://www.okta.com/exk123456" value={ssoIssuer} onChange={(e) => setSsoIssuer(e.target.value)} required />
          <Input label="SAML Single Sign-On Endpoint URL *" placeholder="https://dev-12345.okta.com/app/sso/saml" value={ssoUrl} onChange={(e) => setSsoUrl(e.target.value)} required />
          <Input label="Target Corporate Email Domain (e.g. acmecorp.com)" placeholder="acmecorp.com" value={ssoDomain} onChange={(e) => setSsoDomain(e.target.value)} />

          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createSsoMutation.isPending}>
            Save Enterprise SSO Configuration
          </Button>
        </form>
      </Modal>
    </div>
  );
};
