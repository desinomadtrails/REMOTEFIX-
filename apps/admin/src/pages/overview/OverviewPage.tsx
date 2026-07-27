import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle,
  RefreshCcw, Clock, UserCheck, Plus, ClipboardList
} from "lucide-react";
import { Card, Badge, Button } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const OverviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [seedingSuccess, setSeedingSuccess] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; },
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => { const r = await api.getInvoices(); return r.invoices || []; },
  });

  const seedDatabaseMutation = useMutation({
    mutationFn: () => api.seedDatabase(),
    onSuccess: () => {
      setSeedingSuccess(true);
      queryClient.invalidateQueries();
      setTimeout(() => setSeedingSuccess(false), 3000);
    },
  });

  const totalRevenue = (invoicesData || [])
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.amount), 0);

  const activeBookingsCount = (bookingsData || []).filter(
    (b: any) => ["pending", "assigned", "in_progress"].includes(b.status)
  ).length;

  const completedJobsCount = (bookingsData || []).filter((b: any) => b.status === "completed").length;
  const pendingRequests = (bookingsData || []).filter((b: any) => b.status === "pending");
  const recentJobs = (bookingsData || []).slice(0, 4);

  if (bookingsLoading || invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Revenue</span>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="text-secondary w-5 h-5" />
            <div className="text-2xl font-black font-display text-text">{formatCurrency(totalRevenue)}</div>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Active Dispatches</span>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="text-secondary w-5 h-5" />
            <div className="text-2xl font-black font-display text-text">{activeBookingsCount}</div>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Pending Allocation</span>
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="text-warning w-5 h-5" />
            <div className="text-2xl font-black font-display text-text">{pendingRequests.length}</div>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Completed Repairs</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="text-success w-5 h-5" />
            <div className="text-2xl font-black font-display text-text">{completedJobsCount}</div>
          </div>
        </Card>
      </div>

      {/* Revenue sparkline */}
      <Card glowColor="purple" className="p-6">
        <h3 className="text-sm font-bold font-display text-text mb-4 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={16} className="text-secondary" /> Revenue Trend (SaaS Analytics)
        </h3>
        <div className="relative w-full h-[160px] bg-[#111827]/40 rounded-lg p-4 flex items-end overflow-hidden">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
            <defs>
              <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[30, 75, 120].map(y => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#1f2937" strokeWidth="1" strokeDasharray="4" />
            ))}
            <path d="M 10 110 Q 80 80 130 95 T 240 45 T 390 20 L 390 120 L 10 120 Z" fill="url(#rev-grad)" />
            <path d="M 10 110 Q 80 80 130 95 T 240 45 T 390 20" fill="none" stroke="#8B5CF6" strokeWidth="3" />
            {[[10,110],[130,95],[240,45],[390,20]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="#a78bfa" />
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] text-muted mt-2 px-1">
          <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4 Est.</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card glowColor="purple" className="p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider">Quick Actions</h3>
          <Button variant="cyber" size="sm" className="w-full flex items-center justify-start gap-2 text-xs" onClick={() => window.location.hash = "bookings"}>
            <UserCheck size={13} /> Assign Pending ({pendingRequests.length})
          </Button>
          <Button variant="outline" size="sm" className="w-full flex items-center justify-start gap-2 text-xs">
            <Plus size={13} /> Add Service Item
          </Button>
          {seedingSuccess ? (
            <div className="bg-success/15 border border-success/30 text-success text-xs rounded p-2.5 flex items-center gap-1.5">
              <CheckCircle size={13} /> Database seeded!
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="w-full text-xs text-secondary border border-secondary/20 hover:bg-secondary/10 flex items-center justify-center gap-1.5" onClick={() => seedDatabaseMutation.mutate()} isLoading={seedDatabaseMutation.isPending}>
              <RefreshCcw size={12} /> Inject Mock Dataset
            </Button>
          )}
        </Card>

        {/* Pending requests */}
        <Card glowColor="none" className="lg:col-span-2 p-5">
          <h3 className="text-sm font-bold font-display text-text mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-3">
            <Clock size={15} className="text-secondary" /> Unassigned Incidents ({pendingRequests.length})
          </h3>
          {pendingRequests.length === 0 ? (
            <p className="text-xs text-muted italic py-6 text-center">All requests have been assigned. ✓</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingRequests.slice(0, 3).map((b: any) => (
                <div key={b.id} className="bg-[#111827]/40 border border-border/40 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-primary font-bold block">{b.ticketId}</span>
                    <span className="text-text font-semibold block mt-0.5">{b.name} · {b.deviceType || b.operatingSystem}</span>
                  </div>
                  <Badge variant="warning" className="text-[9px]">{b.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent operations */}
      <Card glowColor="none" className="p-5">
        <h3 className="text-sm font-bold font-display text-text mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-3">
          <ClipboardList size={15} className="text-secondary" /> Recent Operations Log
        </h3>
        {recentJobs.length === 0 ? (
          <p className="text-xs text-muted italic py-4 text-center">No bookings logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentJobs.map((b: any) => (
              <div key={b.id} className="bg-[#111827]/40 border border-border/40 rounded-xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-muted text-[10px]">{b.ticketId || "GUEST"}</span>
                  <span className="font-semibold text-text">{b.name}</span>
                  <Badge variant={b.status === "completed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="text-[9px]">
                    {b.status}
                  </Badge>
                </div>
                <span className="text-muted text-[10px] shrink-0">{b.preferredDate}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
