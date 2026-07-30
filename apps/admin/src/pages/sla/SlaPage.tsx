import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, ShieldAlert, Plus, Zap, AlertTriangle, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const SlaPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "low" | "normal">("high");
  const [responseMinutes, setResponseMinutes] = useState(30);
  const [resolutionMinutes, setResolutionMinutes] = useState(240);
  const [escalationEmail, setEscalationEmail] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [evalMsg, setEvalMsg] = useState("");

  const { data: policiesList = [], isLoading } = useQuery({
    queryKey: ["admin-sla-policies"],
    queryFn: async () => {
      const res = await api.getSlaPolicies();
      return res.policies || [];
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => api.createSlaPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sla-policies"] });
      setCreateModalOpen(false);
      setName("");
      setEscalationEmail("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create SLA policy.");
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () => api.evaluateSlaBreaches(),
    onSuccess: (data: any) => {
      setEvalMsg(data.message || "SLA breach check executed successfully.");
      setTimeout(() => setEvalMsg(""), 4000);
    },
  });

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createPolicyMutation.mutate({
      name,
      priority,
      responseBufferMinutes: responseMinutes,
      resolutionBufferMinutes: resolutionMinutes,
      escalationEmail: escalationEmail || undefined,
      isDefault,
    });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger/10 rounded-full border border-danger/20 text-xs font-semibold uppercase tracking-wider text-danger mb-2 font-display">
            <Clock className="w-3.5 h-3.5" /> SLA Contract Matrix
          </div>
          <h1 className="text-2xl font-black font-display text-text">Service Level Agreement (SLA) &amp; Escalations</h1>
          <p className="text-xs text-muted font-body mt-0.5">
            Configure response/resolution time targets per priority tier and trigger automated breach alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs text-warning border-warning/30" onClick={() => evaluateMutation.mutate()} isLoading={evaluateMutation.isPending}>
            <RefreshCw size={14} /> Evaluate Breaches
          </Button>
          <Button variant="primary" glow className="flex items-center gap-2 text-xs" style={{ backgroundColor: "#8B5CF6", color: "white" }} onClick={() => setCreateModalOpen(true)}>
            <Plus size={15} /> Add SLA Policy
          </Button>
        </div>
      </div>

      {evalMsg && (
        <div className="p-3.5 bg-success/10 border border-success/30 text-success text-xs rounded-xl flex items-center gap-2 font-display font-semibold">
          <CheckCircle2 size={16} /> {evalMsg}
        </div>
      )}

      {/* SLA Policies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : policiesList.length === 0 ? (
        <Card className="text-center py-16 text-muted">
          <ShieldAlert size={40} className="mx-auto mb-3 text-muted/30" />
          <h3 className="text-base font-bold font-display text-text">No SLA Policies Configured</h3>
          <p className="text-xs max-w-sm mx-auto mt-1">Define incident response and resolution time SLAs to enforce contract compliance.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
            Configure First SLA Policy
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policiesList.map((policy: any) => (
            <Card key={policy.id} glowColor={policy.priority === "urgent" || policy.priority === "high" ? "purple" : "cyan"} className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${policy.priority === "urgent" ? "bg-danger/15 text-danger border border-danger/30" : "bg-primary/10 text-primary border border-primary/20"}`}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-display text-text">{policy.name}</h3>
                      <span className="text-[10px] text-muted uppercase font-mono font-bold tracking-wider">{policy.priority} Priority Tier</span>
                    </div>
                  </div>
                  {policy.isDefault && <Badge variant="info" className="text-[9px] uppercase">Default</Badge>}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-b border-border/40 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">First Response Target</span>
                    <span className="font-bold text-text font-display">{policy.responseBufferMinutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Resolution Target</span>
                    <span className="font-bold text-primary font-display">
                      {policy.resolutionBufferMinutes >= 60 ? `${(policy.resolutionBufferMinutes / 60).toFixed(1)} Hours` : `${policy.resolutionBufferMinutes} Mins`}
                    </span>
                  </div>
                </div>

                {policy.escalationEmail && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                    <Mail size={13} className="text-danger" /> Escalation Contact: <span className="text-text font-semibold truncate">{policy.escalationEmail}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40 text-[10px] text-muted font-mono flex items-center justify-between">
                <span>POLICY ID: {policy.id.slice(0, 8)}...</span>
                <span className="text-success font-semibold">Active Enforcement</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE SLA POLICY MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Enterprise SLA Policy">
        <form onSubmit={handleCreatePolicy} className="space-y-4 font-body">
          {errorMsg && <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg">{errorMsg}</div>}

          <Input label="SLA Policy Name *" placeholder="Gold SLA - 15min Response" value={name} onChange={(e) => setName(e.target.value)} required />

          <Select
            label="Priority Tier *"
            options={[
              { value: "urgent", label: "Urgent (System Down / Emergency)" },
              { value: "high", label: "High Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "normal", label: "Normal Business Priority" },
              { value: "low", label: "Low Priority / General Inquiry" },
            ]}
            value={priority}
            onChange={(e: any) => setPriority(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="First Response Target (Minutes) *" type="number" value={responseMinutes} onChange={(e) => setResponseMinutes(parseInt(e.target.value) || 15)} required />
            <Input label="Resolution Target (Minutes) *" type="number" value={resolutionMinutes} onChange={(e) => setResolutionMinutes(parseInt(e.target.value) || 120)} required />
          </div>

          <Input label="Escalation Manager Email" type="email" placeholder="sla-escalations@remotefix.com" value={escalationEmail} onChange={(e) => setEscalationEmail(e.target.value)} />

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isDefaultCheck" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded border-border" />
            <label htmlFor="isDefaultCheck" className="text-xs text-text font-semibold">Set as default SLA policy for unassigned tickets</label>
          </div>

          <Button variant="primary" type="submit" glow className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={createPolicyMutation.isPending}>
            Save &amp; Enforce SLA Policy
          </Button>
        </form>
      </Modal>
    </div>
  );
};
