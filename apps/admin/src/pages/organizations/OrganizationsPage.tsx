import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Users, Shield, Layers, Globe, Server, CheckCircle2, ChevronRight, Lock, Key } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const SYSTEM_ROLES_INFO = [
  { name: "super_admin", label: "Super Admin", desc: "Unrestricted platform-wide governance & infrastructure control." },
  { name: "org_admin", label: "Organization Admin", desc: "Tenant administrator managing departments, endpoints, and billing." },
  { name: "manager", label: "Department Manager", desc: "Monitors incident queues, SLA compliance, and department dispatches." },
  { name: "dispatcher", label: "Service Dispatcher", desc: "Routes bookings to field engineers and schedules technician visits." },
  { name: "technician", label: "Field Technician", desc: "Performs diagnostic check-ins, work logs, and signature capture." },
  { name: "finance", label: "Finance Manager", desc: "Handles GST invoices, payment receipts, and AMC contracts." },
  { name: "viewer", label: "Auditor / Viewer", desc: "Read-only access to organization reports and ticket history." },
];

export const OrganizationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"tenants" | "rbac">("tenants");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deptModalOrgId, setDeptModalOrgId] = useState<string | null>(null);

  // Form State for Organization
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [orgTier, setOrgTier] = useState<"startup" | "smb" | "msp" | "enterprise">("enterprise");
  const [maxEndpoints, setMaxEndpoints] = useState(100);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State for Department
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");

  const { data: orgsData = [], isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const res = await api.getOrganizations();
      return res.organizations || [];
    },
  });

  const { data: rolesData = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await api.getRoles();
      return res.roles || [];
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: any) => api.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      setCreateModalOpen(false);
      setOrgName("");
      setOrgSlug("");
      setOrgDomain("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create organization.");
    },
  });

  const createDeptMutation = useMutation({
    mutationFn: (data: { orgId: string; body: any }) => api.createOrgDepartment(data.orgId, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      setDeptModalOrgId(null);
      setDeptName("");
      setDeptCode("");
    },
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgSlug) return;
    createOrgMutation.mutate({
      name: orgName,
      slug: orgSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      domain: orgDomain || undefined,
      tier: orgTier,
      maxEndpoints,
    });
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptModalOrgId || !deptName) return;
    createDeptMutation.mutate({
      orgId: deptModalOrgId,
      body: { name: deptName, code: deptCode || undefined },
    });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-2 font-display">
            <Building2 className="w-3.5 h-3.5" /> Multi-Tenant &amp; Database-Driven RBAC
          </div>
          <h1 className="text-2xl font-black font-display text-text">Enterprise Organizations &amp; System Roles</h1>
          <p className="text-xs text-muted font-body mt-0.5">
            Manage tenant accounts, department structures, and database-driven RBAC permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card/60 border border-border/50 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab("tenants")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeSubTab === "tenants" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Tenants &amp; Depts
            </button>
            <button
              onClick={() => setActiveSubTab("rbac")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeSubTab === "rbac" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              RBAC Role Matrix
            </button>
          </div>

          <Button variant="primary" glow className="flex items-center gap-2 text-xs" onClick={() => setCreateModalOpen(true)}>
            <Plus size={15} /> Add Organization
          </Button>
        </div>
      </div>

      {activeSubTab === "tenants" ? (
        /* Grid of Organizations */
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : orgsData.length === 0 ? (
          <Card className="text-center py-16 text-muted">
            <Building2 size={40} className="mx-auto mb-3 text-muted/30" />
            <h3 className="text-base font-bold font-display text-text">No Organizations Configured</h3>
            <p className="text-xs max-w-sm mx-auto mt-1">
              Create an enterprise tenant organization to begin managing multi-tenant department dispatches.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
              Onboard First Organization
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgsData.map((org: any) => (
              <Card key={org.id} glowColor="cyan" className="flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-display font-black text-base">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-display text-text">{org.name}</h3>
                        <span className="text-[10px] text-muted font-mono">{org.slug}.remotefix.com</span>
                      </div>
                    </div>
                    <Badge variant={org.status === "active" ? "success" : "danger"} className="text-[9px] uppercase">
                      {org.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-border/40 py-3">
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Plan Tier</span>
                      <span className="font-bold text-primary uppercase font-display">{org.tier}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Max Endpoints</span>
                      <span className="font-bold text-text font-display">{org.maxEndpoints} Endpoints</span>
                    </div>
                  </div>

                  {org.domain && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Globe size={13} className="text-primary" /> Custom Domain: <span className="text-text font-semibold">{org.domain}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted font-body">ID: {org.id.slice(0, 8)}...</span>
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1" onClick={() => setDeptModalOrgId(org.id)}>
                    <Layers size={13} /> Add Dept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* RBAC Roles Matrix */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SYSTEM_ROLES_INFO.map((role) => (
              <Card key={role.name} glowColor="purple" className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-secondary/15 border border-secondary/20 rounded-xl text-secondary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-text">{role.label}</h3>
                    <span className="text-[10px] text-muted font-mono uppercase">{role.name}</span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">{role.desc}</p>
                <div className="pt-2 border-t border-border/40 text-[10px] text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Database-Driven Permission Enforced
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ORGANIZATION MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Onboard Enterprise Organization">
        <form onSubmit={handleCreateOrg} className="space-y-4 font-body">
          {errorMsg && <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg">{errorMsg}</div>}

          <Input label="Organization Name *" placeholder="Acme Cyber Corp" value={orgName} onChange={(e) => { setOrgName(e.target.value); if (!orgSlug) setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")); }} required />
          <Input label="Tenant Slug *" placeholder="acme-corp" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} required />
          <Input label="Custom Domain (Optional)" placeholder="support.acmecorp.com" value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} />

          <Select
            label="Subscription Tier"
            options={[
              { value: "startup", label: "Startup Plan" },
              { value: "smb", label: "SMB Business Plan" },
              { value: "msp", label: "MSP Multi-Client Plan" },
              { value: "enterprise", label: "Enterprise SLA Plan" },
            ]}
            value={orgTier}
            onChange={(e: any) => setOrgTier(e.target.value)}
          />

          <Input label="Max Managed Endpoints" type="number" value={maxEndpoints} onChange={(e) => setMaxEndpoints(parseInt(e.target.value) || 50)} />

          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createOrgMutation.isPending}>
            Create Organization Tenant
          </Button>
        </form>
      </Modal>

      {/* ADD DEPARTMENT MODAL */}
      {deptModalOrgId && (
        <Modal isOpen={!!deptModalOrgId} onClose={() => setDeptModalOrgId(null)} title="Add Department to Organization">
          <form onSubmit={handleCreateDept} className="space-y-4 font-body">
            <Input label="Department Name *" placeholder="e.g. IT Operations, Sales Infrastructure" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
            <Input label="Department Code (Optional)" placeholder="e.g. DEPT-IT-01" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
            <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createDeptMutation.isPending}>
              Create Department
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
