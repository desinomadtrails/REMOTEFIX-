import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Printer, DollarSign, AlertCircle, Percent, Receipt, FileText, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

const GST_RATE = 0.18;

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const BillingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"invoices" | "amc">("invoices");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newAmcOpen, setNewAmcOpen] = useState(false);
  const [invForm, setInvForm] = useState({ bookingId: "", amount: "" });

  // AMC Form State
  const [amcTitle, setAmcTitle] = useState("");
  const [amcDeviceCount, setAmcDeviceCount] = useState(10);
  const [amcStartDate, setAmcStartDate] = useState("");
  const [amcEndDate, setAmcEndDate] = useState("");
  const [amcAmount, setAmcAmount] = useState("");

  const { data: invoicesData, isLoading: invLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => { const r = await api.getInvoices(); return r.invoices || []; },
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; },
  });

  const { data: amcData = [] } = useQuery({
    queryKey: ["admin-amc-contracts"],
    queryFn: async () => { const r = await api.getAmcContracts(); return r.contracts || []; },
  });

  const generateMutation = useMutation({
    mutationFn: (body: any) => api.createInvoice(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-invoices"] }); setNewInvoiceOpen(false); setInvForm({ bookingId: "", amount: "" }); },
    onError: (err: any) => alert(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string; status: string }) => api.updateInvoice(p.id, { status: p.status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-invoices"] }),
    onError: (err: any) => alert(err.message),
  });

  const createAmcMutation = useMutation({
    mutationFn: (body: any) => api.createAmcContract(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-amc-contracts"] });
      setNewAmcOpen(false);
      setAmcTitle("");
      setAmcAmount("");
    },
    onError: (err: any) => alert(err.message),
  });

  const handleCreateAmc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amcTitle || !amcStartDate || !amcEndDate || !amcAmount) return;
    createAmcMutation.mutate({
      title: amcTitle,
      deviceCount: amcDeviceCount,
      startDate: amcStartDate,
      endDate: amcEndDate,
      contractAmount: parseFloat(amcAmount),
    });
  };

  // Metrics
  const paidInvoices = (invoicesData || []).filter((i: any) => i.status === "paid");
  const totalCollected = paidInvoices.reduce((s: number, i: any) => s + parseFloat(i.amount), 0);
  const totalOutstanding = (invoicesData || []).filter((i: any) => i.status === "unpaid").reduce((s: number, i: any) => s + parseFloat(i.amount), 0);
  const totalGst = paidInvoices.reduce((s: number, i: any) => s + (parseFloat(i.amount) - parseFloat(i.amount) / (1 + GST_RATE)), 0);

  const filtered = (invoicesData || []).filter((inv: any) => {
    const sl = search.toLowerCase();
    return (!sl || inv.invoiceNumber.toLowerCase().includes(sl) || inv.bookingId.toLowerCase().includes(sl)) &&
      (statusFilter === "all" || inv.status === statusFilter);
  });

  const selectedInv = (invoicesData || []).find((i: any) => i.id === selectedId);
  const selectedBooking = selectedInv ? (bookingsData || []).find((b: any) => b.id === selectedInv.bookingId) : null;

  if (invLoading) return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-display text-text">Billing, GST Invoices &amp; AMC Contracts</h1>
          <p className="text-xs text-muted mt-0.5">Manage transactional GST invoices, payments, and recurring AMC maintenance contracts.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card/60 border border-border/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeTab === "invoices" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("amc")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeTab === "amc" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              AMC Contracts
            </button>
          </div>

          {activeTab === "invoices" ? (
            <Button variant="primary" glow size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setNewInvoiceOpen(true)}>
              <Plus size={14} /> New Invoice
            </Button>
          ) : (
            <Button variant="primary" glow size="sm" className="flex items-center gap-1.5 text-xs" onClick={() => setNewAmcOpen(true)}>
              <Plus size={14} /> New AMC Contract
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4" glowColor="cyan">
          <div className="p-3 bg-success/15 border border-success/30 rounded-xl text-success"><DollarSign size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">Collected Revenue</span><span className="text-xl font-black font-display text-text">{formatCurrency(totalCollected)}</span></div>
        </Card>

        <Card className="flex items-center gap-4" glowColor="purple">
          <div className="p-3 bg-warning/15 border border-warning/30 rounded-xl text-warning"><AlertCircle size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">Outstanding Unpaid</span><span className="text-xl font-black font-display text-text">{formatCurrency(totalOutstanding)}</span></div>
        </Card>

        <Card className="flex items-center gap-4" glowColor="cyan">
          <div className="p-3 bg-primary/15 border border-primary/30 rounded-xl text-primary"><Percent size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">GST Collected (18%)</span><span className="text-xl font-black font-display text-text">{formatCurrency(totalGst)}</span></div>
        </Card>
      </div>

      {activeTab === "invoices" ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/40 p-4 rounded-xl border border-border/40">
            <div className="relative w-full sm:w-72">
              <Input placeholder="Search invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-xs" />
              <Search className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
            </div>
            <Select options={[{ value: "all", label: "All Statuses" }, { value: "paid", label: "Paid" }, { value: "unpaid", label: "Unpaid" }, { value: "refunded", label: "Refunded" }]} value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} className="text-xs w-full sm:w-44" />
          </div>

          {/* Table */}
          <Card className="p-0 overflow-hidden border border-border/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead className="bg-card/60 text-muted uppercase text-[10px] font-bold border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">GST (18%)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((inv: any) => {
                    const amt = parseFloat(inv.amount);
                    const baseAmt = amt / (1 + GST_RATE);
                    const gstAmt = amt - baseAmt;
                    return (
                      <tr key={inv.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3 font-mono text-muted">{inv.bookingId.slice(0, 8)}...</td>
                        <td className="px-4 py-3 font-bold text-text">{formatCurrency(amt)}</td>
                        <td className="px-4 py-3 text-muted">{formatCurrency(gstAmt)}</td>
                        <td className="px-4 py-3"><Badge variant={inv.status === "paid" ? "success" : inv.status === "unpaid" ? "warning" : "danger"} className="text-[9px] uppercase">{inv.status}</Badge></td>
                        <td className="px-4 py-3 text-muted">{formatDateTime(inv.createdAt)}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="sm" className="text-[10px]" onClick={() => setSelectedId(inv.id)}><Printer size={13} /> Print</Button>
                          {inv.status === "unpaid" && <Button variant="outline" size="sm" className="text-[10px] text-success" onClick={() => updateMutation.mutate({ id: inv.id, status: "paid" })}>Mark Paid</Button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* AMC Contracts View */
        <div className="space-y-4 font-body">
          {amcData.length === 0 ? (
            <Card className="text-center py-16 text-muted">
              <ShieldCheck size={40} className="mx-auto mb-3 text-muted/30" />
              <h3 className="text-base font-bold font-display text-text">No AMC Contracts Configured</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">Create Annual Maintenance Contracts to track covered corporate devices and auto-renewals.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => setNewAmcOpen(true)}>Create First AMC Contract</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amcData.map((amc: any) => (
                <Card key={amc.id} glowColor="cyan" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-display text-text">{amc.title}</h3>
                      <span className="text-[10px] text-primary font-mono">{amc.contractNumber}</span>
                    </div>
                    <Badge variant={amc.status === "active" ? "success" : "warning"} className="text-[9px] uppercase">{amc.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-border/40 py-2.5">
                    <div><span className="text-[10px] text-muted block uppercase">Covered Devices</span><span className="font-bold text-text">{amc.deviceCount} Endpoints</span></div>
                    <div><span className="text-[10px] text-muted block uppercase">Annual Amount</span><span className="font-bold text-primary font-display">{formatCurrency(parseFloat(amc.contractAmount))}</span></div>
                  </div>

                  <div className="text-[10px] text-muted flex justify-between">
                    <span>Valid: {amc.startDate}</span>
                    <span>Expires: {amc.endDate}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW INVOICE MODAL */}
      <Modal isOpen={newInvoiceOpen} onClose={() => setNewInvoiceOpen(false)} title="Generate GST Invoice">
        <form onSubmit={(e) => { e.preventDefault(); if (invForm.bookingId && invForm.amount) generateMutation.mutate({ bookingId: invForm.bookingId, amount: parseFloat(invForm.amount) }); }} className="space-y-4 font-body">
          <Select label="Select Booking *" options={bookingsData ? bookingsData.map((b: any) => ({ value: b.id, label: `#${b.ticketId || b.id.slice(0, 8)} - ${b.name} (${b.serviceId || b.type})` })) : []} value={invForm.bookingId} onChange={(e: any) => setInvForm({ ...invForm, bookingId: e.target.value })} required />
          <Input label="Invoice Total Amount (Inc. 18% GST) *" type="number" placeholder="1999.00" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} required />
          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={generateMutation.isPending}>Issue Printable Invoice</Button>
        </form>
      </Modal>

      {/* NEW AMC MODAL */}
      <Modal isOpen={newAmcOpen} onClose={() => setNewAmcOpen(false)} title="Create Annual Maintenance Contract (AMC)">
        <form onSubmit={handleCreateAmc} className="space-y-4 font-body">
          <Input label="Contract Title *" placeholder="Corporate AMC - Acme Corp 50 Devices" value={amcTitle} onChange={(e) => setAmcTitle(e.target.value)} required />
          <Input label="Covered Hardware Devices *" type="number" value={amcDeviceCount} onChange={(e) => setAmcDeviceCount(parseInt(e.target.value) || 1)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date *" type="date" value={amcStartDate} onChange={(e) => setAmcStartDate(e.target.value)} required />
            <Input label="End Date *" type="date" value={amcEndDate} onChange={(e) => setAmcEndDate(e.target.value)} required />
          </div>
          <Input label="Contract Amount (USD) *" type="number" placeholder="4999.00" value={amcAmount} onChange={(e) => setAmcAmount(e.target.value)} required />
          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createAmcMutation.isPending}>Save AMC Contract</Button>
        </form>
      </Modal>

      {/* PRINTABLE INVOICE MODAL */}
      {selectedInv && (
        <Modal isOpen={!!selectedInv} onClose={() => setSelectedId(null)} title={`GST Invoice ${selectedInv.invoiceNumber}`}>
          <div className="space-y-4 font-body py-2 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-3">
              <div><h3 className="font-bold text-text text-sm">RemoteFix Inc.</h3><p className="text-[10px] text-muted">GSTIN: 27AAAAA0000A1Z5</p></div>
              <div className="text-right font-mono"><span className="block font-bold text-primary">{selectedInv.invoiceNumber}</span><span className="text-[10px] text-muted">{formatDateTime(selectedInv.createdAt)}</span></div>
            </div>

            {selectedBooking && (
              <div className="p-3 bg-black/20 rounded-lg space-y-1">
                <span className="text-[10px] text-muted block uppercase font-bold">Billed To:</span>
                <span className="font-bold text-text block">{selectedBooking.name}</span>
                <span className="text-muted block">{selectedBooking.phone} | {selectedBooking.email}</span>
              </div>
            )}

            <table className="w-full border-t border-b border-border/40 py-2">
              <thead><tr className="text-muted text-[10px] uppercase font-bold text-left"><th className="py-1">Description</th><th className="py-1 text-right">Amount</th></tr></thead>
              <tbody>
                <tr><td className="py-1.5">RemoteFix Service Order ({selectedBooking ? selectedBooking.type : "IT Repair"})</td><td className="py-1.5 text-right font-mono">{formatCurrency(parseFloat(selectedInv.amount) / 1.18)}</td></tr>
                <tr><td className="py-1.5 text-muted">CGST (9%) + SGST (9%)</td><td className="py-1.5 text-right font-mono text-muted">{formatCurrency(parseFloat(selectedInv.amount) - parseFloat(selectedInv.amount) / 1.18)}</td></tr>
              </tbody>
            </table>

            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span>Total Payable:</span>
              <span className="text-primary font-mono">{formatCurrency(parseFloat(selectedInv.amount))}</span>
            </div>

            <Button variant="primary" size="sm" className="w-full mt-3 flex items-center justify-center gap-1.5" onClick={() => window.print()}><Printer size={14} /> Print Tax Invoice PDF</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
