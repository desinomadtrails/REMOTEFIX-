import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit2, Lock, Unlock, Wrench, Activity, CheckCircle, DollarSign, Award, ClipboardList } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const TechniciansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", bio: "", specialities: "", status: "available", userStatus: "active" });

  const { data: engineersData, isLoading } = useQuery({
    queryKey: ["admin-engineers"],
    queryFn: async () => { const r = await api.getEngineers(); return r.engineers || []; },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.createEngineer(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-engineers"] }); setModalOpen(false); resetForm(); },
    onError: (err: any) => alert(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; body: any }) => api.updateEngineer(p.id, p.body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-engineers"] }); setModalOpen(false); resetForm(); },
    onError: (err: any) => alert(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.deleteEngineer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-engineers"] }),
    onError: (err: any) => alert(err.message),
  });

  const resetForm = () => { setEditingId(null); setForm({ fullName: "", email: "", phone: "", bio: "", specialities: "", status: "available", userStatus: "active" }); };
  const openEdit = (eng: any) => { setEditingId(eng.id); setForm({ fullName: eng.fullName, email: eng.email, phone: eng.phone, bio: eng.bio || "", specialities: eng.specialities || "", status: eng.status, userStatus: eng.userStatus }); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate({ id: editingId, body: form });
    else createMutation.mutate(form);
  };

  const filtered = (engineersData || []).filter((eng: any) => {
    const sl = search.toLowerCase();
    return !sl || eng.fullName.toLowerCase().includes(sl) || eng.email.toLowerCase().includes(sl) || (eng.specialities || "").toLowerCase().includes(sl);
  });

  const selected = (engineersData || []).find((eng: any) => eng.id === selectedId);

  if (isLoading) return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div><div className="lg:col-span-2"><Skeleton className="h-80" /></div></div>;

  return (
    <div className="space-y-4 font-body">
      <Card glowColor="none" className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
          <span className="text-sm font-bold font-display text-text uppercase flex items-center gap-2"><Wrench size={14} className="text-secondary" /> Technician Registry</span>
          <Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => { resetForm(); setModalOpen(true); }}><Plus size={13} /> Register Technician</Button>
        </div>
        <div className="relative max-w-md">
          <Input placeholder="Search name, email, skills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-xs" />
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? <Card className="text-center py-10 text-muted text-xs">No technicians found.</Card> : filtered.map((eng: any) => (
            <div key={eng.id} onClick={() => setSelectedId(eng.id)} className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${selectedId === eng.id ? "bg-secondary/15 border-secondary" : "bg-[#111827]/50 border-border hover:border-muted/30"}`}>
              <div className="flex justify-between mb-0.5">
                <span className="font-semibold text-text truncate max-w-[140px]">{eng.fullName}</span>
                <Badge variant={eng.status === "available" ? "success" : eng.status === "busy" ? "warning" : "muted"} className="text-[8px] uppercase">{eng.status}</Badge>
              </div>
              <p className="text-muted truncate">{eng.email}</p>
              {eng.specialitiesList?.slice(0, 2).map((s: string, i: number) => (
                <span key={i} className="inline-block bg-primary/10 text-primary text-[8px] px-1 py-0.5 rounded mr-1 mt-1.5">{s}</span>
              ))}
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex justify-between items-start border-b border-border/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold font-display text-text">{selected.fullName}</h3>
                    <p className="text-[10px] text-muted">Ref: {selected.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="p-2 h-8 text-secondary" onClick={() => openEdit(selected)}><Edit2 size={13} /></Button>
                    <Button variant="ghost" size="sm" className={`p-2 h-8 ${selected.userStatus === "suspended" ? "text-success hover:bg-success/10" : "text-danger hover:bg-danger/10"}`} onClick={() => toggleMutation.mutate(selected.id)} isLoading={toggleMutation.isPending}>
                      {selected.userStatus === "suspended" ? <Unlock size={13} /> : <Lock size={13} />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted block">Availability:</span><Badge variant={selected.status === "available" ? "success" : selected.status === "busy" ? "warning" : "danger"}>{selected.status}</Badge></div>
                  <div><span className="text-muted block">Phone:</span><span className="text-text font-semibold">{selected.phone}</span></div>
                  {selected.bio && <div className="col-span-2"><span className="text-muted block">Bio:</span><span className="text-text leading-relaxed">{selected.bio}</span></div>}
                  <div className="col-span-2"><span className="text-muted block mb-1.5 flex items-center gap-1"><Award size={11} className="text-primary" /> Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selected.specialitiesList || []).map((s: string, i: number) => (
                        <span key={i} className="bg-primary/10 border border-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Activity size={20} className="text-secondary" />, label: "Success Rate", value: `${selected.successRate || 0}%` },
                  { icon: <CheckCircle size={20} className="text-secondary" />, label: "Jobs Completed", value: selected.completedCount || 0 },
                  { icon: <DollarSign size={20} className="text-secondary" />, label: "Revenue", value: formatCurrency(selected.totalRevenueGenerated || 0) },
                ].map((m, i) => (
                  <Card key={i} glowColor="purple" className="p-4 flex items-center gap-3">
                    {m.icon}
                    <div><span className="text-[9px] text-muted uppercase font-semibold block">{m.label}</span><span className="text-sm font-black font-display text-text">{m.value}</span></div>
                  </Card>
                ))}
              </div>

              {/* Assigned bookings */}
              <Card className="p-5">
                <h4 className="text-xs font-bold font-display text-text uppercase mb-3 flex items-center gap-1.5 border-b border-border/30 pb-2">
                  <ClipboardList size={13} className="text-secondary" /> Assigned Jobs ({selected.bookings?.length || 0})
                </h4>
                {(selected.bookings || []).length === 0 ? <p className="text-xs text-muted italic">No assigned jobs.</p> : (
                  <div className="space-y-2">
                    {(selected.bookings || []).map((b: any) => (
                      <div key={b.id} className="flex justify-between items-center text-xs bg-[#111827]/40 border border-border/40 rounded-xl p-3">
                        <div><span className="font-mono text-primary font-bold">{b.ticketId || "JOB"}</span><p className="text-muted truncate max-w-xs">{b.problemDescription}</p></div>
                        <div className="flex items-center gap-2"><span className="text-muted text-[10px]">{b.preferredDate}</span><Badge variant={b.status === "completed" ? "success" : "warning"} className="text-[9px]">{b.status}</Badge></div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="text-center py-24 text-muted">
              <Wrench size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">Select a technician to view profile</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingId ? "Edit Technician" : "Register Technician"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-body">
          {[["Full Name *", "fullName", "text", "Gordon Freeman"], ["Email *", "email", "email", "gordon@blackmesa.com"], ["Phone *", "phone", "tel", "+91-98765-43210"], ["Skills (comma-separated) *", "specialities", "text", "Cisco, WiFi, Malware"]].map(([label, field, type, ph]) => (
            <Input key={field as string} label={label as string} type={type as string} placeholder={ph as string} value={(form as any)[field as string]} onChange={e => setForm(f => ({ ...f, [field as string]: e.target.value }))} required={(label as string).endsWith("*")} />
          ))}
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Bio</label>
            <textarea rows={2} placeholder="e.g. 10 years of network infrastructure..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Availability" options={[{label:"Available",value:"available"},{label:"Busy",value:"busy"},{label:"Offline",value:"offline"}]} value={form.status} onChange={(e: any) => setForm(f => ({ ...f, status: e.target.value }))} />
            <Select label="Account" options={[{label:"Active",value:"active"},{label:"Suspended",value:"suspended"}]} value={form.userStatus} onChange={(e: any) => setForm(f => ({ ...f, userStatus: e.target.value }))} />
          </div>
          <Button variant="primary" type="submit" className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "Save Changes" : "Register Technician"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
