import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, BookOpen, Receipt, UserPlus, Wrench, AlertTriangle, Info, Mail, Send, Plus, RefreshCw, FileText, Activity } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"in_app" | "templates" | "queue">("in_app");
  const [newTemplateModalOpen, setNewTemplateModalOpen] = useState(false);

  // Template Form State
  const [eventKey, setEventKey] = useState("ticket.assigned");
  const [channel, setChannel] = useState<"email" | "in_app" | "push" | "webhook">("email");
  const [subject, setSubject] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");

  const { data: queueData = [], isLoading: queueLoading, refetch: refetchQueue } = useQuery({
    queryKey: ["admin-notification-queue"],
    queryFn: async () => { const r = await api.getNotificationQueue(); return r.queue || []; },
    refetchInterval: 10000,
  });

  const { data: templatesData = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["admin-notification-templates"],
    queryFn: async () => { const r = await api.getNotificationTemplates(); return r.templates || []; },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => api.createNotificationTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notification-templates"] });
      setNewTemplateModalOpen(false);
      setSubject("");
      setBodyTemplate("");
    },
    onError: (err: any) => alert(err.message),
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventKey || !subject || !bodyTemplate) return;
    createTemplateMutation.mutate({ eventKey, channel, subject, bodyTemplate });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-2 font-display">
            <Bell className="w-3.5 h-3.5" /> Centralized Enterprise Notification Engine
          </div>
          <h1 className="text-2xl font-black font-display text-text">Notification Center &amp; Template Manager</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage multi-channel notifications (In-App, Email, Push, Webhooks), dispatch queue, and custom event templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card/60 border border-border/50 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab("in_app")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeSubTab === "in_app" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Live Feed
            </button>
            <button
              onClick={() => setActiveSubTab("templates")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeSubTab === "templates" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Template Editor
            </button>
            <button
              onClick={() => setActiveSubTab("queue")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeSubTab === "queue" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Queue Monitor
            </button>
          </div>

          <Button variant="primary" glow size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setNewTemplateModalOpen(true)}>
            <Plus size={14} /> New Template
          </Button>
        </div>
      </div>

      {activeSubTab === "in_app" ? (
        /* LIVE FEED */
        <div className="space-y-4 font-body">
          {queueData.length === 0 ? (
            <Card className="text-center py-16 text-muted">
              <Bell size={40} className="mx-auto mb-3 text-muted/30" />
              <h3 className="text-base font-bold font-display text-text">No Recent Notifications</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">System events (ticket dispatches, SLA breaches, invoice receipts) will appear here automatically.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {queueData.map((n: any) => (
                <Card key={n.id} glowColor="none" className="p-4 flex items-start gap-4 border border-border/40 hover:border-primary/30 transition-colors">
                  <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                    <Bell size={18} />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold font-display text-text">{n.title}</h3>
                      <Badge variant={n.status === "sent" ? "success" : n.status === "pending" ? "warning" : "danger"} className="text-[9px] uppercase">
                        {n.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted font-mono pt-1">
                      <span>Event: <strong className="text-primary">{n.eventKey}</strong></span>
                      <span>Channel: <strong className="text-text uppercase">{n.channel}</strong></span>
                      <span>Recipient: {n.recipient}</span>
                      <span>{formatDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === "templates" ? (
        /* TEMPLATES TAB */
        <div className="space-y-4 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesData.map((t: any) => (
              <Card key={t.id} glowColor="purple" className="flex flex-col justify-between h-full space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-display text-text">{t.subject}</h3>
                      <span className="text-[10px] text-primary font-mono">{t.eventKey}</span>
                    </div>
                    <Badge variant="info" className="text-[9px] uppercase">{t.channel}</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed p-2.5 bg-black/30 border border-border/30 rounded-lg font-mono text-[11px]">
                    {t.bodyTemplate}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] text-muted font-mono">
                  <span>Channel: {t.channel}</span>
                  <Badge variant={t.isEnabled ? "success" : "danger"} className="text-[9px] uppercase">{t.isEnabled ? "Active" : "Disabled"}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* QUEUE MONITOR TAB */
        <Card className="p-0 overflow-hidden border border-border/40">
          <div className="p-4 bg-card/40 border-b border-border/40 flex justify-between items-center text-xs">
            <span className="font-bold text-text font-display flex items-center gap-1.5">
              <Activity size={14} className="text-primary" /> Live Dispatcher Queue Monitor
            </span>
            <Button variant="ghost" size="sm" className="text-[10px] flex items-center gap-1" onClick={() => refetchQueue()}>
              <RefreshCw size={12} /> Sync Queue
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-card/60 text-muted uppercase text-[10px] font-bold border-b border-border/40">
                <tr>
                  <th className="px-4 py-3">Event Key</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retries</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {queueData.map((q: any) => (
                  <tr key={q.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{q.eventKey}</td>
                    <td className="px-4 py-3 uppercase font-semibold text-text">{q.channel}</td>
                    <td className="px-4 py-3 font-mono text-muted">{q.recipient}</td>
                    <td className="px-4 py-3">
                      <Badge variant={q.status === "sent" ? "success" : q.status === "pending" ? "warning" : "danger"} className="text-[9px] uppercase">
                        {q.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">{q.retryCount}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted">{formatDateTime(q.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* NEW TEMPLATE MODAL */}
      <Modal isOpen={newTemplateModalOpen} onClose={() => setNewTemplateModalOpen(false)} title="Create Notification Event Template">
        <form onSubmit={handleCreateTemplate} className="space-y-4 font-body">
          <Select
            label="Notification Event *"
            options={[
              { value: "ticket.assigned", label: "Ticket Assigned to Technician" },
              { value: "ticket.closed", label: "Ticket Resolved / Closed" },
              { value: "sla.breach", label: "SLA Response / Resolution Breach" },
              { value: "warranty.expiry", label: "ITAM Hardware Warranty Expiry" },
              { value: "amc.renewal", label: "Annual Maintenance Contract Renewal" },
              { value: "invoice.paid", label: "GST Invoice Payment Received" },
              { value: "rmm.offline", label: "RMM Endpoint Agent Offline Alert" },
            ]}
            value={eventKey}
            onChange={(e: any) => setEventKey(e.target.value)}
          />

          <Select
            label="Notification Channel *"
            options={[
              { value: "email", label: "Email (SMTP)" },
              { value: "in_app", label: "In-App Console Alert" },
              { value: "push", label: "Browser Web Push" },
              { value: "webhook", label: "Corporate Webhook URL" },
            ]}
            value={channel}
            onChange={(e: any) => setChannel(e.target.value)}
          />

          <Input label="Email / Notification Subject *" placeholder="Ticket Assigned: {ticketId}" value={subject} onChange={(e) => setSubject(e.target.value)} required />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text block">Body Template (Supports Variables) *</label>
            <textarea
              className="w-full p-3 bg-black/40 border border-border/40 rounded-xl text-xs font-mono text-text outline-none focus:border-primary h-28"
              placeholder="You have been assigned to service booking #{ticketId} for customer {customerName}."
              value={bodyTemplate}
              onChange={(e) => setBodyTemplate(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createTemplateMutation.isPending}>
            Save Notification Template
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export function NotificationBell({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" aria-label="Notifications">
      <Bell size={18} className="text-muted hover:text-text transition-colors" />
    </button>
  );
}
