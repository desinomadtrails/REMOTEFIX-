import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Download, Edit2, Lock, Unlock, FileText, History, Users } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", companyName: "", billingAddress: "", userStatus: "active" });

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => { const r = await api.getCustomers(); return r.customers || []; },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.createCustomer(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-customers"] }); setModalOpen(false); resetForm(); },
    onError: (err: any) => alert(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; body: any }) => api.updateCustomer(p.id, p.body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-customers"] }); setModalOpen(false); resetForm(); },
    onError: (err: any) => alert(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
    onError: (err: any) => alert(err.message),
  });

  const resetForm = () => { setEditingId(null); setForm({ fullName: "", email: "", phone: "", companyName: "", billingAddress: "", userStatus: "active" }); };
  const openEdit = (c: any) => { setEditingId(c.id); setForm({ fullName: c.fullName, email: c.email, phone: c.phone, companyName: c.companyName || "", billingAddress: c.billingAddress || "", userStatus: c.userStatus }); setModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate({ id: editingId, body: form });
    else createMutation.mutate(form);
  };

  const filtered = (customersData || []).filter((c: any) => {
    const sl = search.toLowerCase();
    return (!sl || c.fullName.toLowerCase().includes(sl) || c.email.toLowerCase().includes(sl) || c.phone.includes(sl) || (c.companyName || "").toLowerCase().includes(sl)) &&
      (typeFilter === "all" || (typeFilter === "guest" ? c.isGuest : !c.isGuest));
  });

  const selected = (customersData || []).find((c: any) => c.id === selectedId);

  const handleExport = () => exportCSV(
    `remotefix_customers_${new Date().toISOString().split("T")[0]}.csv`,
    ["Name", "Email", "Phone", "Company", "Type", "Status", "Bookings", "Spent"],
    filtered.map((c: any) => [c.fullName, c.email, c.phone, c.companyName || "", c.isGuest ? "Guest" : "Member", c.userStatus, c.bookingCount || 0, parseFloat(c.totalSpent || "0").toFixed(2)])
  );

  if (isLoading) return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-1 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div><div className="lg:col-span-2"><Skeleton className="h-80" /></div></div>;

  return (
    <div className="space-y-4 font-body">
      {/* Toolbar */}
      <Card glowColor="none" className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
          <span className="text-sm font-bold font-display text-text uppercase flex items-center gap-2"><Users size={14} className="text-secondary" /> Customer CRM</span>
          <div className="flex gap-2">
            <Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => { resetForm(); setModalOpen(true); }}><Plus size={13} /> Add Customer</Button>
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5" onClick={handleExport}><Download size={13} /> Export CSV</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Input placeholder="Search name, email, company..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-xs" />
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          </div>
          <select className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="registered">Registered</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? <Card className="text-center py-10 text-muted text-xs">No customers found.</Card> : filtered.map((c: any) => (
            <div key={c.id} onClick={() => setSelectedId(c.id)} className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${selectedId === c.id ? "bg-secondary/15 border-secondary" : "bg-[#111827]/50 border-border hover:border-muted/30"}`}>
              <div className="flex justify-between mb-0.5">
                <span className="font-semibold text-text truncate max-w-[140px]">{c.fullName}</span>
                <Badge variant={c.isGuest ? "muted" : "info"} className="text-[8px] uppercase">{c.isGuest ? "Guest" : "Member"}</Badge>
              </div>
              <p className="text-muted truncate">{c.email}</p>
              <div className="flex justify-between mt-2 pt-2 border-t border-border/20 text-[10px]">
                <span>Bookings: <strong className="text-text">{c.bookingCount || 0}</strong></span>
                <span className="text-success font-bold">{formatCurrency(parseFloat(c.totalSpent || "0"))}</span>
              </div>
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
                    <p className="text-[10px] text-muted">ID: {selected.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="p-2 h-8 text-secondary" onClick={() => openEdit(selected)}><Edit2 size={13} /></Button>
                    <Button variant="ghost" size="sm" className={`p-2 h-8 ${selected.userStatus === "suspended" ? "text-success hover:bg-success/10" : "text-danger hover:bg-danger/10"}`} onClick={() => toggleMutation.mutate(selected.id)} isLoading={toggleMutation.isPending}>
                      {selected.userStatus === "suspended" ? <Unlock size={13} /> : <Lock size={13} />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[["Email", selected.email], ["Phone", selected.phone], ["Company", selected.companyName || "N/A"], ["Status", selected.userStatus]].map(([l, v]) => (
                    <div key={l}><span className="text-muted block">{l}:</span><span className="text-text font-semibold">{v}</span></div>
                  ))}
                  {selected.billingAddress && <div className="col-span-2"><span className="text-muted block">Address:</span><span className="text-text font-semibold">{selected.billingAddress}</span></div>}
                </div>
              </Card>

              <Card className="p-5">
                <h4 className="text-xs font-bold font-display text-text uppercase mb-3 flex items-center gap-1.5 border-b border-border/30 pb-2">
                  <History size={13} className="text-secondary" /> Booking History ({selected.bookings?.length || 0})
                </h4>
                {(selected.bookings || []).length === 0 ? <p className="text-xs text-muted italic">No bookings yet.</p> : (
                  <div className="space-y-2">
                    {(selected.bookings || []).map((b: any) => (
                      <div key={b.id} className="flex justify-between items-center text-xs bg-[#111827]/40 border border-border/40 rounded-xl p-3">
                        <div><span className="font-mono text-primary font-bold">{b.ticketId || "GUEST"}</span><p className="text-muted truncate max-w-xs">{b.problemDescription}</p></div>
                        <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="text-[9px]">{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <h4 className="text-xs font-bold font-display text-text uppercase mb-3 flex items-center gap-1.5 border-b border-border/30 pb-2">
                  <FileText size={13} className="text-secondary" /> Invoices ({selected.invoices?.length || 0})
                </h4>
                {(selected.invoices || []).length === 0 ? <p className="text-xs text-muted italic">No invoices yet.</p> : (
                  <div className="space-y-2">
                    {(selected.invoices || []).map((inv: any) => (
                      <div key={inv.id} className="flex justify-between items-center text-xs bg-[#111827]/40 border border-border/40 rounded-xl p-3">
                        <div><span className="text-primary font-bold">{inv.invoiceNumber}</span><p className="font-bold text-text mt-0.5">{formatCurrency(parseFloat(inv.amount))}</p></div>
                        <Badge variant={inv.status === "paid" ? "success" : "warning"} className="text-[9px]">{inv.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="text-center py-24 text-muted">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">Select a customer to view details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editingId ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-body">
          {[["Full Name *", "fullName", "text", "e.g. John Doe"], ["Email *", "email", "email", "john@email.com"], ["Phone *", "phone", "tel", "+91-98765-43210"], ["Company", "companyName", "text", "Acme Inc."], ["Billing Address", "billingAddress", "text", "123 Main St..."]].map(([label, field, type, ph]) => (
            <Input key={field} label={label as string} type={type as string} placeholder={ph as string} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required={label.endsWith("*")} />
          ))}
          <Select label="Account Status" options={[{label:"Active",value:"active"},{label:"Suspended",value:"suspended"},{label:"Pending",value:"pending"}]} value={form.userStatus} onChange={(e: any) => setForm(f => ({ ...f, userStatus: e.target.value }))} />
          <Button variant="primary" type="submit" className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "Save Changes" : "Create Customer"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
