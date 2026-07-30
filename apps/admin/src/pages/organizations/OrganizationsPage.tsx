import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Users, Shield, Layers, Globe, Server, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const OrganizationsPage: React.FC = () => {
  const queryClient = useQueryClient();
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

  const { data: orgsData, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const res = await api.getOrganizations();
      return res.organizations || [];
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
            <Building2 className="w-3.5 h-3.5" /> Multi-Tenant Hierarchy
          </div>
          <h1 className="text-2xl font-black font-display text-text">Enterprise Organizations &amp; MSP Tenants</h1>
          <p className="text-xs text-muted font-body mt-0.5">
            Manage multi-client tenant accounts, corporate department hierarchies, and endpoint capacities.
          </p>
        </div>

        <Button variant="primary" glow className="flex items-center gap-2 text-xs" onClick={() => setCreateModalOpen(true)}>
          <Plus size={15} /> Add Organization
        </Button>
      </div>

      {/* Grid of Organizations */}
      {isLoading ? (
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
