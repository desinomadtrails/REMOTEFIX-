import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Printer, DollarSign, AlertCircle, Percent, Receipt } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

const GST_RATE = 0.18;

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const BillingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [invForm, setInvForm] = useState({ bookingId: "", amount: "" });

  const { data: invoicesData, isLoading: invLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => { const r = await api.getInvoices(); return r.invoices || []; },
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; },
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

  // Reports
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

  const baseAmount = selectedInv ? parseFloat(selectedInv.amount) / (1 + GST_RATE) : 0;
  const gstAmount = selectedInv ? parseFloat(selectedInv.amount) - baseAmount : 0;

  return (
    <div className="space-y-5 font-body">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Collected Revenue", value: formatCurrency(totalCollected), icon: <DollarSign size={20} className="text-success" />, cls: "text-success" },
          { label: "Outstanding Dues", value: formatCurrency(totalOutstanding), icon: <AlertCircle size={20} className="text-warning" />, cls: "text-warning" },
          { label: "GST Collected (18%)", value: formatCurrency(totalGst), icon: <Percent size={20} className="text-primary" />, cls: "text-primary" },
        ].map((m, i) => (
          <Card key={i} glowColor="purple" className="p-5 flex items-center justify-between">
            <div><span className="text-[10px] text-muted uppercase font-semibold block">{m.label}</span><span className={`text-xl font-black font-display block mt-1 ${m.cls}`}>{m.value}</span></div>
            {m.icon}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices list */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-display text-text uppercase">Invoices Registry</h3>
            <Button variant="cyber" size="sm" className="text-xs" onClick={() => setNewInvoiceOpen(true)}>+ Create</Button>
          </div>
          <div className="relative">
            <Input placeholder="Search invoice #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-xs" />
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
          </div>
          <select className="w-full h-10 px-3 bg-[#111827]/60 border border-border text-xs text-text rounded-lg outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {[["all","All States"],["unpaid","Unpaid"],["paid","Paid"],["cancelled","Cancelled"],["refunded","Refunded"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
            {filtered.length === 0 ? <Card className="text-center py-10 text-muted text-xs">No invoices found.</Card> : filtered.map((inv: any) => (
              <div key={inv.id} onClick={() => setSelectedId(inv.id)} className={`p-3.5 rounded-xl border cursor-pointer text-xs transition-all ${selectedId === inv.id ? "bg-secondary/15 border-secondary" : "bg-[#111827]/50 border-border hover:border-muted/30"}`}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono font-bold text-text">{inv.invoiceNumber}</span>
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "unpaid" ? "warning" : "danger"} className="text-[8px]">{inv.status}</Badge>
                </div>
                <div className="flex justify-between text-[10px] border-t border-border/10 pt-1.5 mt-1.5">
                  <span className="text-muted">{formatDateTime(inv.createdAt).split(" ")[0]}</span>
                  <strong className="text-text">{formatCurrency(parseFloat(inv.amount))}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice detail */}
        <div className="lg:col-span-2">
          {selectedInv ? (
            <div className="flex flex-col gap-4">
              {/* Controls */}
              <Card className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Payment Status:</span>
                  <select className="bg-[#111827]/60 border border-border text-xs text-text font-bold rounded p-1.5 outline-none" value={selectedInv.status} onChange={e => updateMutation.mutate({ id: selectedInv.id, status: e.target.value })}>
                    {["unpaid","paid","cancelled","refunded"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-secondary border-secondary/30" onClick={() => window.print()}>
                  <Printer size={13} /> Print PDF
                </Button>
              </Card>

              {/* Printable invoice */}
              <div id="printable-invoice" className="bg-[#111827]/60 border border-border/80 rounded-2xl p-8 text-xs flex flex-col gap-6 print:bg-white print:border-none print:text-black">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-border/30 pb-6 print:border-black/20">
                  <div>
                    <h3 className="text-2xl font-black font-display text-text print:text-black">RemoteFix Inc.</h3>
                    <p className="text-muted mt-1 print:text-black/60">Enterprise IT Dispatches &amp; Repairs<br />100 Tech Park Drive, New Delhi - 110020<br />GSTIN: {localStorage.getItem("rf_company_gstin") || "22XXXXX0000X1Z5"}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-primary print:text-black">TAX INVOICE</div>
                    <h4 className="text-xl font-black font-mono text-text mt-1 print:text-black">{selectedInv.invoiceNumber}</h4>
                    <div className="text-[10px] text-muted mt-1 print:text-black/60">Issued: {formatDateTime(selectedInv.createdAt)}</div>
                    <Badge variant={selectedInv.status === "paid" ? "success" : "warning"} className="mt-2">{selectedInv.status.toUpperCase()}</Badge>
                  </div>
                </div>

                {/* Bill to / Booking ref */}
                <div className="grid grid-cols-2 gap-6 border-b border-border/30 pb-6 print:border-black/20">
                  <div>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1.5">Bill To:</span>
                    {selectedBooking ? (
                      <div className="space-y-0.5 text-text">
                        <div className="font-bold text-sm">{selectedBooking.name}</div>
                        <div className="text-muted print:text-black/75">{selectedBooking.email}</div>
                        <div className="text-muted print:text-black/75">Phone: {selectedBooking.phone}</div>
                        {selectedBooking.address && <div className="text-muted leading-relaxed print:text-black/75 mt-1">{selectedBooking.address}</div>}
                      </div>
                    ) : <span className="text-muted italic">Guest Client</span>}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1.5">Service Reference:</span>
                    <div className="space-y-0.5 text-text">
                      <div>Ticket: <strong className="font-mono">{selectedBooking?.ticketId || "N/A"}</strong></div>
                      <div>Type: <span className="uppercase font-semibold">{selectedBooking?.type || "Standard"}</span></div>
                      <div>Priority: <span className="uppercase font-semibold">{selectedBooking?.priority || "Normal"}</span></div>
                      {selectedBooking?.deviceType && <div>Device: <span>{selectedBooking.brand} {selectedBooking.model} ({selectedBooking.deviceType})</span></div>}
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-border/40 text-[10px] text-muted uppercase font-bold print:border-black/20 print:text-black/60">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Taxable</th>
                    <th className="pb-2 text-right">GST 18%</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr></thead>
                  <tbody>
                    <tr className="text-text font-semibold border-b border-border/20 print:border-black/10">
                      <td className="py-4">
                        <span className="font-bold block">IT Hardware Repair &amp; Diagnostics</span>
                        <span className="text-muted text-[10px] block mt-0.5">{selectedBooking?.problemDescription || "Platform service dispatch"}</span>
                      </td>
                      <td className="py-4 text-right font-mono">{formatCurrency(baseAmount)}</td>
                      <td className="py-4 text-right font-mono text-primary print:text-black">{formatCurrency(gstAmount)}</td>
                      <td className="py-4 text-right font-mono font-bold">{formatCurrency(parseFloat(selectedInv.amount))}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end border-t border-border/30 pt-4 print:border-black/20">
                  <div className="w-60 space-y-1.5 text-xs">
                    {[["Taxable Value", formatCurrency(baseAmount)], ["CGST (9.0%)", formatCurrency(gstAmount / 2)], ["SGST (9.0%)", formatCurrency(gstAmount / 2)]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-muted print:text-black/70"><span>{l}:</span><span className="font-mono">{v}</span></div>
                    ))}
                    <div className="flex justify-between border-t border-border/30 pt-2 text-sm font-bold print:border-black/20 print:text-black">
                      <span className="text-text">Total Payable:</span>
                      <span className="font-mono text-secondary print:text-black">{formatCurrency(parseFloat(selectedInv.amount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="text-center py-24 text-muted">
              <Receipt size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">Select an invoice to view &amp; print</p>
            </Card>
          )}
        </div>
      </div>

      {/* Generate Invoice Modal */}
      <Modal isOpen={newInvoiceOpen} onClose={() => setNewInvoiceOpen(false)} title="Generate New Invoice">
        <form onSubmit={e => { e.preventDefault(); generateMutation.mutate({ bookingId: invForm.bookingId, amount: parseFloat(invForm.amount) }); }} className="flex flex-col gap-4 font-body">
          <Select
            label="Booking Reference *"
            options={(bookingsData || []).filter((b: any) => ["completed","assigned","in_progress"].includes(b.status)).map((b: any) => ({ label: `${b.ticketId} — ${b.name}`, value: b.id }))}
            value={invForm.bookingId}
            onChange={(e: any) => setInvForm(f => ({ ...f, bookingId: e.target.value }))}
          />
          <Input label="Base Amount (₹) *" placeholder="1500.00" value={invForm.amount} onChange={e => setInvForm(f => ({ ...f, amount: e.target.value }))} required />
          <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3 text-[10px] text-muted">
            GST will be displayed on the invoice as: CGST 9% + SGST 9% = 18% total on the base amount.
          </div>
          <Button variant="primary" type="submit" className="w-full" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={generateMutation.isPending}>
            Generate GST Invoice
          </Button>
        </form>
      </Modal>
    </div>
  );
};
