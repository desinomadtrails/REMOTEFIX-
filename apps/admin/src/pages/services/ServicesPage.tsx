import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database } from "lucide-react";
import { Card, Badge, Button, Modal, Input, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Support", estimatedDurationMinutes: "60" });

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => { const r = await api.getAllServicesAdmin(); return r.services || []; },
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.createService(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-services"] }); setModalOpen(false); setForm({ name: "", description: "", price: "", category: "Support", estimatedDurationMinutes: "60" }); },
    onError: (err: any) => alert(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.toggleService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-services"] }),
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(6)].map((_,i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-5 font-body">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold font-display text-text flex items-center gap-2"><Database size={17} className="text-secondary" /> Service Catalog</h2>
        <Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setModalOpen(true)}><Plus size={13} /> Add Service</Button>
      </div>

      {(!servicesData || servicesData.length === 0) ? (
        <Card className="text-center py-20 text-muted">
          <Database size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No services in catalog yet.</p>
          <p className="text-xs mt-1">Add a service or seed the database from the Analytics tab.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesData.map((s: any) => (
            <Card key={s.id} glowColor="none" className="flex flex-col h-full p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-semibold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-display tracking-wider">{s.category}</span>
                <Badge variant={s.isActive ? "success" : "danger"} className="text-[9px]">{s.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <h3 className="text-base font-bold font-display text-text mt-1">{s.name}</h3>
              <p className="text-xs text-muted font-body mt-2 leading-relaxed flex-grow">{s.description}</p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30">
                <span className="text-lg font-black font-display text-text">{formatCurrency(parseFloat(s.price))}</span>
                <span className="text-[10px] text-muted">{s.estimatedDurationMinutes} min</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs" onClick={() => toggleMutation.mutate(s.id)} isLoading={toggleMutation.isPending}>
                Toggle Active / Inactive
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Catalog Service">
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, price: parseFloat(form.price), estimatedDurationMinutes: parseInt(form.estimatedDurationMinutes), isActive: true }); }} className="flex flex-col gap-3 font-body">
          <Input label="Service Name *" placeholder="e.g. Server Migration" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹) *" placeholder="199.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            <Input label="Duration (mins)" placeholder="60" value={form.estimatedDurationMinutes} onChange={e => setForm(f => ({ ...f, estimatedDurationMinutes: e.target.value }))} />
          </div>
          <Select label="Category" options={["Support","Networking","Security","Installation","Storage","Consulting"].map(v => ({ label: v, value: v }))} value={form.category} onChange={(e: any) => setForm(f => ({ ...f, category: e.target.value }))} />
          <div>
            <label className="text-xs font-semibold text-muted font-display block mb-1">Description *</label>
            <textarea rows={3} placeholder="What does this service cover..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary resize-none" />
          </div>
          <Button variant="primary" type="submit" className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={createMutation.isPending}>Add Service</Button>
        </form>
      </Modal>
    </div>
  );
};
