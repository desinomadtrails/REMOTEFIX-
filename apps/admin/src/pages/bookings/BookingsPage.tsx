import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, SlidersHorizontal, CheckSquare, Square,
  ChevronLeft, ChevronRight, Badge as BadgeIcon
} from "lucide-react";
import { Card, Badge, Button, Input } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

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

  const filtered = (bookingsData || []).filter((b: any) => {
    const sl = searchTerm.toLowerCase();
    return (
      (!sl || (b.ticketId || "").toLowerCase().includes(sl) || b.name.toLowerCase().includes(sl) || b.email.toLowerCase().includes(sl) || (b.problemDescription || "").toLowerCase().includes(sl)) &&
      (statusFilter === "all" || b.status === statusFilter) &&
      (priorityFilter === "all" || b.priority === priorityFilter) &&
      (typeFilter === "all" || b.type === typeFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, priorityFilter, typeFilter]);

  const toggleAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((b: any) => b.id));
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const applyBulk = async () => {
    if (!selectedIds.length || !bulkAction) return;
    const statusMap: Record<string, { status: string; engineerId?: string }> = {
      complete: { status: "completed" },
      cancel: { status: "cancelled" },
    };
    const target = statusMap[bulkAction];
    if (!target) return;
    for (const id of selectedIds) await updateMutation.mutateAsync({ id, ...target });
    setSelectedIds([]); setBulkAction("");
  };

  if (isLoading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  return (
    <div className="space-y-5 font-body">
      {/* Filters */}
      <Card glowColor="none" className="p-5">
        <div className="flex items-center gap-2 text-sm font-bold font-display text-text uppercase tracking-wider mb-4">
          <SlidersHorizontal size={15} className="text-secondary" /> Filters &amp; Search
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Input placeholder="Ticket, name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 text-xs" />
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          </div>
          {[
            { value: statusFilter, setter: setStatusFilter, opts: [["all","All States"],["pending","Pending"],["assigned","Assigned"],["in_progress","In Progress"],["completed","Completed"],["cancelled","Cancelled"]] },
            { value: priorityFilter, setter: setPriorityFilter, opts: [["all","All Priorities"],["normal","Normal"],["high","High"],["emergency","Emergency"]] },
            { value: typeFilter, setter: setTypeFilter, opts: [["all","All Types"],["remote","Remote"],["onsite","On-Site"],["emergency","Emergency"],["amc","AMC"]] },
          ].map((sel, i) => (
            <select key={i} className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none" value={sel.value} onChange={e => sel.setter(e.target.value)}>
              {sel.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>

        {paginated.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-t border-border/20">
            <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-muted hover:text-text cursor-pointer">
              {selectedIds.length === paginated.length ? <CheckSquare size={16} className="text-secondary" /> : <Square size={16} />}
              Select page ({selectedIds.length} selected)
            </button>
            <div className="flex items-center gap-2">
              <select className="bg-[#111827]/60 border border-border text-xs text-text rounded p-1.5 outline-none" value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
                <option value="">-- Bulk Action --</option>
                <option value="complete">Mark Completed</option>
                <option value="cancel">Mark Cancelled</option>
              </select>
              <Button variant="cyber" size="sm" className="text-xs py-1 px-3" onClick={applyBulk} disabled={!selectedIds.length || !bulkAction}>Apply</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Booking cards */}
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
                    {b.remarks && <div className="text-primary text-[10px]">Remarks: {b.remarks}</div>}
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
                  {!["completed","cancelled"].includes(b.status) && (
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" className="text-[10px] py-1 text-success hover:bg-success/10 flex-1" onClick={() => updateMutation.mutate({ id: b.id, status: "completed" })}>Complete</Button>
                      <Button variant="ghost" size="sm" className="text-[10px] py-1 text-danger hover:bg-danger/10 flex-1" onClick={() => updateMutation.mutate({ id: b.id, status: "cancelled" })}>Cancel</Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-muted">
          <span>{filtered.length} total · Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="p-2 h-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={15} />
            </Button>
            <Button variant="outline" size="sm" className="p-2 h-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
