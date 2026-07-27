import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, BookOpen, Receipt, UserPlus, Wrench, AlertTriangle, Info } from "lucide-react";
import { Card, Badge, Button } from "@remotefix/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api.js";
import { formatDateTime } from "@remotefix/utils";

// ── Types ────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: "booking" | "invoice" | "customer" | "engineer" | "alert" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ── Icon resolver ────────────────────────────────────────────────
function NotifIcon({ type }: { type: Notification["type"] }) {
  const map: Record<Notification["type"], React.ReactNode> = {
    booking: <BookOpen size={14} className="text-secondary" />,
    invoice: <Receipt size={14} className="text-success" />,
    customer: <UserPlus size={14} className="text-cyan-400" />,
    engineer: <Wrench size={14} className="text-warning" />,
    alert: <AlertTriangle size={14} className="text-danger" />,
    info: <Info size={14} className="text-muted" />,
  };
  return <span>{map[type]}</span>;
}

// ── Storage helpers ──────────────────────────────────────────────
const STORAGE_KEY = "rf_notifications";

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

// ── Build notifications from live data ──────────────────────────
function buildNotifications(bookings: any[], invoices: any[], customers: any[], engineers: any[]): Notification[] {
  const items: Notification[] = [];

  // Latest 5 bookings
  (bookings || []).slice(0, 5).forEach((b: any) => {
    items.push({
      id: `booking-${b.id}`,
      type: "booking",
      title: b.status === "pending" ? "New Booking Received" : `Booking ${b.status}`,
      message: `${b.name} booked a ${b.type} service · Ticket ${b.ticketId || "GUEST"}`,
      timestamp: b.createdAt,
      read: false,
    });
  });

  // Unpaid invoices
  (invoices || []).filter((i: any) => i.status === "unpaid").slice(0, 3).forEach((inv: any) => {
    items.push({
      id: `invoice-${inv.id}`,
      type: "invoice",
      title: "Outstanding Invoice",
      message: `Invoice ${inv.invoiceNumber} is unpaid · Amount due`,
      timestamp: inv.createdAt,
      read: false,
    });
  });

  // New customers
  (customers || []).slice(0, 3).forEach((c: any) => {
    items.push({
      id: `customer-${c.id}`,
      type: "customer",
      title: "New Customer Registered",
      message: `${c.fullName} (${c.isGuest ? "Guest" : "Member"}) joined the platform`,
      timestamp: c.createdAt || new Date().toISOString(),
      read: false,
    });
  });

  // Offline engineers
  (engineers || []).filter((e: any) => e.status === "offline").slice(0, 2).forEach((eng: any) => {
    items.push({
      id: `engineer-${eng.id}`,
      type: "engineer",
      title: "Technician Offline",
      message: `${eng.fullName} is currently offline and unavailable for dispatch`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  });

  // Sort by recency
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Notification Bell (exported for use in nav) ──────────────────
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const unread = loadNotifications().filter(n => !n.read).length;
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
      aria-label="Notifications"
    >
      <Bell size={18} className="text-muted hover:text-text transition-colors" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

// ── Main Notifications Page ──────────────────────────────────────
export const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [smtpHost, setSmtpHost] = useState(() => localStorage.getItem("rf_smtp_host") || "");
  const [smtpPort, setSmtpPort] = useState(() => localStorage.getItem("rf_smtp_port") || "587");
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem("rf_smtp_user") || "");
  const [twilioSid, setTwilioSid] = useState(() => localStorage.getItem("rf_twilio_sid") || "");
  const [twilioFrom, setTwilioFrom] = useState(() => localStorage.getItem("rf_twilio_from") || "");
  const [saved, setSaved] = useState(false);

  const { data: bookingsData } = useQuery({ queryKey: ["admin-bookings"], queryFn: async () => { const r = await api.getBookings(); return r.bookings || []; } });
  const { data: invoicesData } = useQuery({ queryKey: ["admin-invoices"], queryFn: async () => { const r = await api.getInvoices(); return r.invoices || []; } });
  const { data: customersData } = useQuery({ queryKey: ["admin-customers"], queryFn: async () => { const r = await api.getCustomers(); return r.customers || []; } });
  const { data: engineersData } = useQuery({ queryKey: ["admin-engineers"], queryFn: async () => { const r = await api.getEngineers(); return r.engineers || []; } });

  useEffect(() => {
    // Merge stored read-state with freshly built notifications
    const stored = loadNotifications();
    const readIds = new Set(stored.filter(n => n.read).map(n => n.id));
    const fresh = buildNotifications(bookingsData || [], invoicesData || [], customersData || [], engineersData || []);
    const merged = fresh.map(n => ({ ...n, read: readIds.has(n.id) }));
    setNotifs(merged);
    saveNotifications(merged);
  }, [bookingsData, invoicesData, customersData, engineersData]);

  const markRead = (id: string) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated); saveNotifications(updated);
  };

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated); saveNotifications(updated);
  };

  const handleSaveChannels = () => {
    localStorage.setItem("rf_smtp_host", smtpHost);
    localStorage.setItem("rf_smtp_port", smtpPort);
    localStorage.setItem("rf_smtp_user", smtpUser);
    localStorage.setItem("rf_twilio_sid", twilioSid);
    localStorage.setItem("rf_twilio_from", twilioFrom);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const displayed = filter === "unread" ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black font-display text-text flex items-center gap-2">
            <Bell size={20} className="text-secondary" /> Notification Center
          </h2>
          <p className="text-xs text-muted mt-0.5">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border/50">
            <button onClick={() => setFilter("all")} className={`text-xs px-3 py-1.5 font-semibold transition-colors cursor-pointer ${filter === "all" ? "bg-secondary text-white" : "text-muted hover:text-text"}`}>All</button>
            <button onClick={() => setFilter("unread")} className={`text-xs px-3 py-1.5 font-semibold transition-colors cursor-pointer ${filter === "unread" ? "bg-secondary text-white" : "text-muted hover:text-text"}`}>Unread ({unreadCount})</button>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-muted hover:text-text" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {displayed.length === 0 ? (
            <Card className="text-center py-16 text-muted">
              <Bell size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No notifications</p>
              <p className="text-xs mt-1">System events will appear here automatically.</p>
            </Card>
          ) : (
            displayed.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${n.read ? "bg-[#111827]/30 border-border/20 opacity-60" : "bg-[#111827]/60 border-border/50 hover:border-secondary/30"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-white/5" : "bg-secondary/10 border border-secondary/20"}`}>
                  <NotifIcon type={n.type} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs font-bold ${n.read ? "text-muted" : "text-text"}`}>{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-muted/60 mt-1 block">{formatDateTime(n.timestamp)}</span>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-[10px] text-secondary hover:underline shrink-0 cursor-pointer mt-0.5">
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Channel Config */}
        <div className="flex flex-col gap-4">
          <Card glowColor="none" className="p-5">
            <h3 className="text-xs font-bold font-display text-text uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border/30 pb-3">
              ✉️ Email (SMTP) Config
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-muted uppercase font-semibold block mb-1">SMTP Host</label>
                <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted uppercase font-semibold block mb-1">Port</label>
                  <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase font-semibold block mb-1">Username</label>
                  <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="no-reply@..." className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </Card>

          <Card glowColor="none" className="p-5">
            <h3 className="text-xs font-bold font-display text-text uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border/30 pb-3">
              📱 SMS (Twilio) Config
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-muted uppercase font-semibold block mb-1">Twilio Account SID</label>
                <input value={twilioSid} onChange={e => setTwilioSid(e.target.value)} placeholder="ACxxxxxxxxxxxxxxxx" className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase font-semibold block mb-1">Sender Number</label>
                <input value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)} placeholder="+1234567890" className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary" />
              </div>
            </div>
          </Card>

          <Button variant="cyber" className="w-full text-xs flex items-center justify-center gap-2" onClick={handleSaveChannels}>
            {saved ? <><Check size={14} /> Saved!</> : "Save Channel Configuration"}
          </Button>

          <div className="bg-[#111827]/40 border border-border/50 rounded-xl p-4 text-[10px] text-muted leading-relaxed">
            <span className="text-text font-semibold block mb-1">ℹ️ Integration Note</span>
            Email and SMS dispatch require a backend worker. Connect these credentials to your Cloudflare Worker environment variables (<code>SMTP_*</code>, <code>TWILIO_*</code>) to activate live delivery.
          </div>
        </div>
      </div>
    </div>
  );
};
