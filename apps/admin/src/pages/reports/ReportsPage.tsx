import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle,
  Download, Users, Wrench, BarChart2, PieChart, Activity
} from "lucide-react";
import { Card, Badge } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatCurrency } from "@remotefix/utils";

// ── Skeleton loader ─────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

// ── SVG Sparkline (generic line chart) ─────────────────────────
function Sparkline({ values, color = "#8B5CF6", height = 60 }: { values: number[]; color?: string; height?: number }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 300; const h = height;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 8) - 4}`).join(" ");
  const area = `M 0,${h} L ${pts.split(" ").map((p, i) => (i === 0 ? `0,${h} L ${p}` : p)).join(" ")} L ${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${h} L ${pts} L ${w},${h} Z`} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1)) * w} cy={h - (v / max) * (h - 8) - 4} r="3" fill={color} />
      ))}
    </svg>
  );
}

// ── SVG Bar Chart ───────────────────────────────────────────────
function BarChart({ values, labels, color = "#8B5CF6" }: { values: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...values, 1);
  const w = 300; const h = 100;
  const barW = w / values.length - 4;
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full">
      {values.map((v, i) => {
        const bh = (v / max) * h;
        const x = i * (w / values.length) + 2;
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={barW} height={bh} rx="3" fill={color} opacity="0.8" />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize="8" fill="#6B7280">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut / Pie Chart ───────────────────────────────────────────
function DonutChart({ slices }: { slices: { value: number; color: string; label: string }[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  let startAngle = -Math.PI / 2;
  const r = 45; const cx = 60; const cy = 60;
  const paths = slices.map(sl => {
    const angle = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle);
    const y2 = cy + r * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: sl.color, label: sl.label, pct: Math.round((sl.value / total) * 100) };
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-24 h-24 shrink-0">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity="0.85" />)}
        <circle cx={cx} cy={cy} r="28" fill="#0a0f1a" />
      </svg>
      <div className="flex flex-col gap-1">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted">{p.label}</span>
            <span className="text-text font-bold ml-auto pl-2">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CSV Exporter ────────────────────────────────────────────────
function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const ReportsPage: React.FC = () => {
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; },
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => { const r = await api.getInvoices(); return r.invoices || []; },
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => { const r = await api.getCustomers(); return r.customers || []; },
  });

  const { data: engineersData, isLoading: engineersLoading } = useQuery({
    queryKey: ["admin-engineers"],
    queryFn: async () => { const r = await api.getEngineers(); return r.engineers || []; },
  });

  const isLoading = bookingsLoading || invoicesLoading || customersLoading || engineersLoading;

  // ── Derived metrics ──────────────────────────────────────────
  const paidInvoices = (invoicesData || []).filter((i: any) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s: number, i: any) => s + parseFloat(i.amount), 0);
  const totalOutstanding = (invoicesData || []).filter((i: any) => i.status === "unpaid").reduce((s: number, i: any) => s + parseFloat(i.amount), 0);
  const totalBookings = (bookingsData || []).length;
  const completedBookings = (bookingsData || []).filter((b: any) => b.status === "completed").length;
  const completionRate = totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0;

  // ── Monthly revenue (last 6 months) ─────────────────────────
  const now = new Date();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthInvoices = paidInvoices.filter((inv: any) => {
      const invDate = new Date(inv.createdAt);
      return invDate.getFullYear() === d.getFullYear() && invDate.getMonth() === d.getMonth();
    });
    return { month: MONTHS[d.getMonth()], value: monthInvoices.reduce((s: number, i: any) => s + parseFloat(i.amount), 0) };
  });

  // ── Monthly bookings (last 6 months) ────────────────────────
  const monthlyBookings = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = (bookingsData || []).filter((b: any) => {
      const bd = new Date(b.createdAt);
      return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
    }).length;
    return { month: MONTHS[d.getMonth()], value: count };
  });

  // ── Booking status distribution ──────────────────────────────
  const statusSlices = [
    { label: "Completed", value: (bookingsData || []).filter((b: any) => b.status === "completed").length, color: "#22c55e" },
    { label: "In Progress", value: (bookingsData || []).filter((b: any) => b.status === "in_progress" || b.status === "assigned").length, color: "#f59e0b" },
    { label: "Pending", value: (bookingsData || []).filter((b: any) => b.status === "pending").length, color: "#8B5CF6" },
    { label: "Cancelled", value: (bookingsData || []).filter((b: any) => b.status === "cancelled").length, color: "#ef4444" },
  ];

  // ── Service type distribution ────────────────────────────────
  const typeSlices = [
    { label: "Remote", value: (bookingsData || []).filter((b: any) => b.type === "remote").length, color: "#06b6d4" },
    { label: "On-Site", value: (bookingsData || []).filter((b: any) => b.type === "onsite").length, color: "#8B5CF6" },
    { label: "Emergency", value: (bookingsData || []).filter((b: any) => b.type === "emergency").length, color: "#ef4444" },
    { label: "AMC", value: (bookingsData || []).filter((b: any) => b.type === "amc").length, color: "#22c55e" },
  ];

  // ── Technician performance table ─────────────────────────────
  const techPerformance = (engineersData || []).map((eng: any) => ({
    name: eng.fullName,
    completed: eng.completedCount || 0,
    successRate: eng.successRate || 0,
    revenue: eng.totalRevenueGenerated || 0,
    status: eng.status,
  })).sort((a: any, b: any) => b.revenue - a.revenue);

  // ── Customer growth (last 6 months) ──────────────────────────
  const customerGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = (customersData || []).filter((c: any) => {
      const cd = new Date(c.createdAt || now);
      return cd.getFullYear() <= d.getFullYear() && cd.getMonth() <= d.getMonth();
    }).length;
    return { month: MONTHS[d.getMonth()], value: count };
  });

  // ── Export handlers ──────────────────────────────────────────
  const handleExportRevenue = () => exportCSV(
    `remotefix_revenue_${new Date().toISOString().split("T")[0]}.csv`,
    ["Month", "Revenue (INR)"],
    monthlyRevenue.map(m => [m.month, m.value.toFixed(2)])
  );

  const handleExportBookings = () => exportCSV(
    `remotefix_bookings_${new Date().toISOString().split("T")[0]}.csv`,
    ["Ticket ID", "Client", "Status", "Type", "Priority", "Date"],
    (bookingsData || []).map((b: any) => [b.ticketId || "GUEST", b.name, b.status, b.type, b.priority || "normal", b.preferredDate])
  );

  const handleExportTechnicians = () => exportCSV(
    `remotefix_technicians_${new Date().toISOString().split("T")[0]}.csv`,
    ["Name", "Completed Jobs", "Success Rate (%)", "Revenue Generated (INR)", "Status"],
    techPerformance.map((t: any) => [t.name, t.completed, t.successRate, t.revenue.toFixed(2), t.status])
  );

  const handleExportCustomers = () => exportCSV(
    `remotefix_customers_${new Date().toISOString().split("T")[0]}.csv`,
    ["Name", "Email", "Phone", "Type", "Bookings", "Total Spent (INR)"],
    (customersData || []).map((c: any) => [c.fullName, c.email, c.phone, c.isGuest ? "Guest" : "Registered", c.bookingCount || 0, parseFloat(c.totalSpent || "0").toFixed(2)])
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block">Total Revenue</span>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="text-success w-5 h-5" />
            <span className="text-xl font-black font-display text-success">{formatCurrency(totalRevenue)}</span>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block">Outstanding</span>
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="text-warning w-5 h-5" />
            <span className="text-xl font-black font-display text-warning">{formatCurrency(totalOutstanding)}</span>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block">Completion Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="text-secondary w-5 h-5" />
            <span className="text-xl font-black font-display text-text">{completionRate}%</span>
          </div>
        </Card>
        <Card glowColor="purple" className="p-5">
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold block">Total Customers</span>
          <div className="flex items-center gap-2 mt-1">
            <Users className="text-secondary w-5 h-5" />
            <span className="text-xl font-black font-display text-text">{(customersData || []).length}</span>
          </div>
        </Card>
      </div>

      {/* Revenue & Bookings Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glowColor="purple" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={15} className="text-success" /> Monthly Revenue
            </h3>
            <button onClick={handleExportRevenue} className="flex items-center gap-1 text-[10px] text-muted hover:text-secondary transition-colors cursor-pointer">
              <Download size={12} /> Export
            </button>
          </div>
          <Sparkline values={monthlyRevenue.map(m => m.value)} color="#22c55e" height={80} />
          <div className="flex justify-between text-[9px] text-muted mt-1 px-1">
            {monthlyRevenue.map(m => <span key={m.month}>{m.month}</span>)}
          </div>
          <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-3 gap-2 text-xs">
            {monthlyRevenue.slice(-3).map(m => (
              <div key={m.month} className="text-center">
                <div className="text-[10px] text-muted">{m.month}</div>
                <div className="font-bold text-text">{formatCurrency(m.value)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card glowColor="purple" className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={15} className="text-secondary" /> Monthly Bookings
            </h3>
            <button onClick={handleExportBookings} className="flex items-center gap-1 text-[10px] text-muted hover:text-secondary transition-colors cursor-pointer">
              <Download size={12} /> Export
            </button>
          </div>
          <BarChart values={monthlyBookings.map(m => m.value)} labels={monthlyBookings.map(m => m.month)} color="#8B5CF6" />
          <div className="mt-3 pt-3 border-t border-border/30 text-xs text-center text-muted">
            Total: <strong className="text-text">{totalBookings} bookings</strong> · Completed: <strong className="text-success">{completedBookings}</strong>
          </div>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glowColor="none" className="p-6">
          <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2 mb-4">
            <PieChart size={15} className="text-secondary" /> Booking Status Distribution
          </h3>
          <DonutChart slices={statusSlices} />
        </Card>

        <Card glowColor="none" className="p-6">
          <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2 mb-4">
            <PieChart size={15} className="text-secondary" /> Service Type Breakdown
          </h3>
          <DonutChart slices={typeSlices} />
        </Card>
      </div>

      {/* Customer Growth Chart */}
      <Card glowColor="none" className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2">
            <Users size={15} className="text-secondary" /> Customer Growth (Last 6 Months)
          </h3>
          <button onClick={handleExportCustomers} className="flex items-center gap-1 text-[10px] text-muted hover:text-secondary transition-colors cursor-pointer">
            <Download size={12} /> Export CSV
          </button>
        </div>
        <Sparkline values={customerGrowth.map(m => m.value)} color="#06b6d4" height={70} />
        <div className="flex justify-between text-[9px] text-muted mt-1 px-1">
          {customerGrowth.map(m => <span key={m.month}>{m.month}</span>)}
        </div>
      </Card>

      {/* Technician Performance Table */}
      <Card glowColor="none" className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold font-display text-text uppercase tracking-wider flex items-center gap-2">
            <Wrench size={15} className="text-secondary" /> Technician Performance Leaderboard
          </h3>
          <button onClick={handleExportTechnicians} className="flex items-center gap-1 text-[10px] text-muted hover:text-secondary transition-colors cursor-pointer">
            <Download size={12} /> Export CSV
          </button>
        </div>
        {techPerformance.length === 0 ? (
          <div className="text-center py-10 text-muted text-xs">No technician data available. Seed the database first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-muted border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-bold uppercase font-display text-text">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Technician</th>
                  <th className="pb-3 pr-4 text-right">Jobs Done</th>
                  <th className="pb-3 pr-4 text-right">Success Rate</th>
                  <th className="pb-3 pr-4 text-right">Revenue</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {techPerformance.map((t: any, i: number) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-mono text-muted">#{i + 1}</td>
                    <td className="py-3 pr-4 font-semibold text-text">{t.name}</td>
                    <td className="py-3 pr-4 text-right font-bold text-text">{t.completed}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={t.successRate >= 80 ? "text-success font-bold" : t.successRate >= 60 ? "text-warning font-bold" : "text-danger font-bold"}>
                        {t.successRate}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-text">{formatCurrency(t.revenue)}</td>
                    <td className="py-3">
                      <Badge variant={t.status === "available" ? "success" : t.status === "busy" ? "warning" : "muted"} className="text-[9px]">
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
