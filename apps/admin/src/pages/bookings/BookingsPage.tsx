import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, SlidersHorizontal, CheckSquare, Square,
  ChevronLeft, ChevronRight, Badge as BadgeIcon, Wrench, Bot, Sparkles, AlertCircle, CheckCircle2, Zap
} from "lucide-react";
import { Card, Badge, Button, Input, Modal } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";
import { TechnicianWorkflowModal } from "../technicians/TechnicianWorkflowModal.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const ITEMS_PER_PAGE = 5;

export const BookingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [workflowBooking, setWorkflowBooking] = useState<any>(null);

  // AI Copilot Modal State
  const [aiBooking, setAiBooking] = useState<any>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; },
  });

  const { data: engineersData } = useQuery({
    queryKey: ["admin-engineers"],
    queryFn: async () => { const r = await api.getEngineers(); return r.engineers || []; },
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; status: string; engineerId?: string }) =>
      api.updateBookingStatus(p.id, { status: p.status, engineerId: p.engineerId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const handleRunAiDiagnose = async (b: any) => {
    setAiBooking(b);
    setAiLoading(true);
    setAiDiagnosis(null);
    try {
      const res = await api.aiDiagnose(b.type || "IT Incident", b.problemDescription || "System Issue", b.deviceType);
      setAiDiagnosis(res.diagnosis);
    } catch (err: any) {
      alert("AI Diagnosis failed: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = (bookingsData || []).filter((b: any) => {
    const sl = searchTerm.toLowerCase();
    return (
      (!sl || (b.ticketId || "").toLowerCase().includes(sl) || b.name.toLowerCase().includes(sl) || b.email.toLowerCase().includes(sl) || (b.problemDescription || "").toLowerCase().includes(sl)) &&
      (statusFilter === "all" || b.status === statusFilter) &&
      (priorityFilter === "all" || b.priority === priorityFilter) &&
      (typeFilter === "all" || b.type === typeFilter)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((b: any) => b.id));
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleBulkApply = () => {
    if (!bulkAction || selectedIds.length === 0) return;
    selectedIds.forEach(id => updateMutation.mutate({ id, status: bulkAction }));
    setSelectedIds([]);
    setBulkAction("");
  };

  if (isLoading) return <div className="space-y-4 font-body"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-display text-text">Booking Queue &amp; Incident Dispatch</h1>
          <p className="text-xs text-muted mt-0.5 font-body">Manage service requests, assign field engineers, and run AI Incident Diagnosis.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-card/40 p-4 rounded-xl border border-border/40">
        <div className="relative w-full md:w-72">
          <Input placeholder="Search ticket ID, customer, issue..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-9 text-xs" />
          <Search className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select className="bg-[#111827]/80 border border-border/60 text-xs text-text rounded-lg px-2.5 py-2 outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select className="bg-[#111827]/80 border border-border/60 text-xs text-text rounded-lg px-2.5 py-2 outline-none" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Priorities</option>
            <option value="emergency">Emergency</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Bookings Queue */}
      {paginated.length === 0 ? (
        <Card className="text-center py-16 text-muted">
          <Search size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No bookings match your filters.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {paginated.map((b: any) => {
            const sel = selectedIds.includes(b.id);
            return (
              <Card key={b.id} glowColor="none" className={`p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${sel ? "border-secondary/40 bg-secondary/5" : ""}`}>
                <div className="flex items-start gap-3 flex-grow min-w-0">
                  <button onClick={() => toggleOne(b.id)} className="text-muted hover:text-text mt-0.5 shrink-0 cursor-pointer">
                    {sel ? <CheckSquare size={17} className="text-secondary" /> : <Square size={17} />}
                  </button>
                  <div className="text-xs space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px]">{b.ticketId || "GUEST"}</span>
                      <span className="font-display font-bold text-sm text-text">{b.name}</span>
                      <Badge variant={b.priority === "emergency" ? "danger" : b.priority === "high" ? "warning" : "info"} className="text-[9px]">{b.priority || "normal"}</Badge>
                      <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="text-[9px]">{b.status}</Badge>
                    </div>
                    <div className="text-muted">{b.email} · {b.phone}</div>
                    <div>Device: <span className="text-text font-semibold">{b.brand ? `${b.brand} ${b.model}` : b.operatingSystem}</span></div>
                    <div>Scheduled: <span className="text-text">{b.preferredDate} · {b.preferredTime}</span></div>
                    {b.address && <div className="text-muted truncate max-w-md">📍 {b.address}</div>}
                    <div className="text-muted truncate max-w-lg">{b.problemDescription}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  <select
                    className="bg-[#111827]/60 border border-border text-[11px] text-text rounded p-1.5 outline-none w-full"
                    value={b.engineerId || ""}
                    onChange={e => updateMutation.mutate({ id: b.id, status: e.target.value ? "assigned" : "pending", engineerId: e.target.value || undefined })}
                  >
                    <option value="">-- Unassigned --</option>
                    {(engineersData || []).map((eng: any) => (
                      <option key={eng.id} value={eng.id}>{eng.fullName}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="text-[10px] py-1 flex items-center justify-center gap-1 text-primary border-primary/30 flex-1" onClick={() => handleRunAiDiagnose(b)}>
                      <Sparkles size={12} /> AI Copilot
                    </Button>
                    <Button variant="cyber" size="sm" className="text-[10px] py-1 flex items-center justify-center gap-1 flex-1" onClick={() => setWorkflowBooking(b)}>
                      <Wrench size={11} /> Field Workflow
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI DIAGNOSIS MODAL */}
      {aiBooking && (
        <Modal isOpen={!!aiBooking} onClose={() => setAiBooking(null)} title={`AI Copilot Diagnosis — #${aiBooking.ticketId || "GUEST"}`}>
          <div className="space-y-4 font-body py-1 text-xs">
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl space-y-1">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block font-display flex items-center gap-1">
                <Bot size={13} /> Customer Incident Report
              </span>
              <p className="text-text font-semibold">{aiBooking.problemDescription}</p>
            </div>

            {aiLoading ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles size={28} className="mx-auto text-primary animate-spin" />
                <p className="text-xs text-muted font-display">Analyzing hardware symptoms &amp; generating AI resolution script...</p>
              </div>
            ) : aiDiagnosis ? (
              <div className="space-y-4">
                <div className="p-3 bg-card/60 border border-border/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">Predicted Root Cause</span>
                  <span className="text-sm font-bold font-display text-primary">{aiDiagnosis.rootCauseSummary}</span>
                  <span className="text-[10px] text-muted block mt-1">Est. Repair Time: {aiDiagnosis.estimatedFixMinutes} mins</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted uppercase font-bold block">Probable Causes</span>
                  <ul className="list-disc pl-4 space-y-1 text-muted">
                    {aiDiagnosis.probableCauses.map((c: string, idx: number) => (
                      <li key={idx}><span className="text-text">{c}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted uppercase font-bold block">Recommended Repair Script for Technicians</span>
                  <div className="p-3 bg-black/40 border border-border/40 rounded-xl space-y-2 font-mono text-[11px]">
                    {aiDiagnosis.recommendedSteps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-secondary font-bold shrink-0">{idx + 1}.</span>
                        <span className="text-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}

      {/* Technician Field Workflow Modal */}
      {workflowBooking && (
        <TechnicianWorkflowModal
          isOpen={!!workflowBooking}
          onClose={() => setWorkflowBooking(null)}
          booking={workflowBooking}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })}
        />
      )}
    </div>
  );
};
