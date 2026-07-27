import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Calendar, CreditCard, LifeBuoy, FileText, Send, User, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button, Card, Badge, Modal, Input, GlowDivider, Select } from "@remotefix/ui";
import { api } from "../services/api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bookings" | "invoices" | "tickets">("bookings");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Modal States
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [ticketBookingId, setTicketBookingId] = useState("");

  // Queries
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => api.getMe(),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await api.getBookings();
      return res.bookings || [];
    },
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await api.getInvoices();
      return res.invoices || [];
    },
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await api.getTickets();
      return res.tickets || [];
    },
  });

  const { data: ticketThreadData } = useQuery({
    queryKey: ["ticket-thread", openTicketId],
    queryFn: async () => {
      if (!openTicketId) return null;
      return api.getTicketById(openTicketId);
    },
    enabled: !!openTicketId,
  });

  // Mutations
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) =>
      api.updateBookingStatus(bookingId, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const submitPaymentMutation = useMutation({
    mutationFn: (paymentPayload: any) => api.submitPayment(paymentPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setPayInvoiceId(null);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: (payload: { ticketId: string; message: string }) =>
      api.sendTicketMessage(payload.ticketId, payload.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-thread", openTicketId] });
      setReplyMessage("");
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload: any) => api.createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setNewTicketOpen(false);
      setTicketSubject("");
      setTicketDescription("");
      setTicketBookingId("");
    },
  });

  // Helpers
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoiceId || !cardNumber || !cardExpiry || !cardCvv) return;
    
    submitPaymentMutation.mutate({
      invoiceId: payInvoiceId,
      paymentMethod: "Credit Card",
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
      amount: payAmount,
    });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openTicketId || !replyMessage.trim()) return;
    sendReplyMutation.mutate({ ticketId: openTicketId, message: replyMessage });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    createTicketMutation.mutate({
      subject: ticketSubject,
      description: ticketDescription,
      priority: ticketPriority,
      bookingId: ticketBookingId || undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-black font-display text-text">
            Welcome, {userProfile?.user?.fullName || "Valued Customer"}
          </h1>
          <p className="text-sm text-muted font-body mt-1">
            Account: <span className="font-semibold text-text">{userProfile?.user?.email}</span> (Role: {userProfile?.user?.role})
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/book")}>
          Book New Incident
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/40 pb-4 mb-8 justify-start sm:justify-start">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Calendar size={16} />
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <FileText size={16} />
          Billing & Invoices
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${
            activeTab === "tickets"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <LifeBuoy size={16} />
          Support Tickets
        </button>
      </div>

      {/* BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div>
          {bookingsLoading ? (
            <div className="text-center py-12">Loading appointments...</div>
          ) : !bookingsData || bookingsData.length === 0 ? (
            <Card className="text-center py-12 text-muted font-body">
              No appointments registered. Click "Book New Incident" to start.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookingsData.map((booking: any) => (
                <Card key={booking.id} glowColor="none" className="flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs text-muted font-body block uppercase tracking-wider">
                        Type: {booking.type}
                      </span>
                      <h3 className="text-lg font-bold font-display text-text mt-0.5">
                        {booking.problemDescription.slice(0, 50)}...
                      </h3>
                    </div>
                    <Badge
                      variant={
                        booking.status === "completed"
                          ? "success"
                          : booking.status === "cancelled"
                          ? "danger"
                          : booking.status === "in_progress"
                          ? "info"
                          : "warning"
                      }
                      glow
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="font-body text-xs text-muted space-y-1">
                    <div>Date: <span className="text-text font-semibold">{booking.preferredDate}</span></div>
                    <div>Time slot: <span className="text-text font-semibold">{booking.preferredTime}</span></div>
                    <div>Operating System: <span className="text-text font-semibold">{booking.operatingSystem}</span></div>
                    {booking.address && <div>Location: <span className="text-text font-semibold">{booking.address}</span></div>}
                  </div>

                  {booking.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger/10 flex items-center justify-center gap-1 mt-2 w-full"
                      onClick={() => cancelBookingMutation.mutate(booking.id)}
                      isLoading={cancelBookingMutation.isPending}
                    >
                      <Trash2 size={14} />
                      Cancel Appointment
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === "invoices" && (
        <div>
          {invoicesLoading ? (
            <div className="text-center py-12">Loading invoices...</div>
          ) : !invoicesData || invoicesData.length === 0 ? (
            <Card className="text-center py-12 text-muted font-body">
              No bills or invoices issued yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoicesData.map((inv: any) => (
                <Card key={inv.id} glowColor="none" className="flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs text-primary font-display font-semibold tracking-wide uppercase">
                        Invoice No: {inv.invoiceNumber}
                      </span>
                      <div className="text-2xl font-black font-display text-text mt-1">
                        {formatCurrency(parseFloat(inv.amount))}
                      </div>
                    </div>
                    <Badge variant={inv.status === "paid" ? "success" : "warning"} glow>
                      {inv.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted font-body mt-2">
                    Issued: {formatDateTime(inv.createdAt)}
                  </div>

                  {inv.status === "unpaid" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 mt-4"
                      onClick={() => {
                        setPayInvoiceId(inv.id);
                        setPayAmount(parseFloat(inv.amount));
                      }}
                    >
                      <CreditCard size={14} />
                      Pay Invoice
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUPPORT TICKETS TAB */}
      {activeTab === "tickets" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-display text-text">Customer Tickets</h2>
            <Button variant="cyber" size="sm" onClick={() => setNewTicketOpen(true)}>
              Open Support Ticket
            </Button>
          </div>

          {ticketsLoading ? (
            <div className="text-center py-12">Loading tickets...</div>
          ) : !ticketsData || ticketsData.length === 0 ? (
            <Card className="text-center py-12 text-muted font-body">
              No support tickets opened.
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {ticketsData.map((ticket: any) => (
                <Card
                  key={ticket.id}
                  className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-primary/30"
                  onClick={() => setOpenTicketId(ticket.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-body">Ticket ID: {ticket.id.slice(0, 8)}</span>
                      <Badge variant={ticket.priority === "urgent" || ticket.priority === "high" ? "danger" : "muted"} className="py-0">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold font-display text-text mt-1">{ticket.subject}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ticket.status === "resolved" || ticket.status === "closed" ? "success" : "warning"}>
                      {ticket.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Messages
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BILL PAYMENT MODAL */}
      <Modal isOpen={!!payInvoiceId} onClose={() => setPayInvoiceId(null)} title="Secure Payment Gateway">
        <form onSubmit={handlePayment} className="flex flex-col gap-4 font-body">
          <div className="text-center bg-[#111827]/40 p-4 border border-border rounded-lg mb-2">
            <span className="text-xs text-muted block uppercase">Amount to pay</span>
            <span className="text-3xl font-black font-display text-primary">{formatCurrency(payAmount)}</span>
          </div>

          <Input
            label="Cardholder Name"
            placeholder="John Doe"
            required
          />

          <Input
            label="Credit Card Number"
            placeholder="4111 2222 3333 4444"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry (MM/YY)"
              placeholder="12/28"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              maxLength={5}
              required
            />
            <Input
              label="Security Code (CVV)"
              type="password"
              placeholder="123"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
              maxLength={3}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted mt-2">
            <ShieldCheck size={16} className="text-success" />
            Connections are protected using 256-bit TLS secure encryption.
          </div>

          <Button variant="primary" type="submit" isLoading={submitPaymentMutation.isPending} className="w-full mt-4">
            Authorize Transaction
          </Button>
        </form>
      </Modal>

      {/* NEW SUPPORT TICKET MODAL */}
      <Modal isOpen={newTicketOpen} onClose={() => setNewTicketOpen(false)} title="Open Support Ticket">
        <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 font-body">
          <Input
            label="Subject"
            placeholder="Issue summary (e.g. WiFi keeps disconnecting)"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            required
          />

          <Select
            label="Priority Level"
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
            value={ticketPriority}
            onChange={(e: any) => setTicketPriority(e.target.value as any)}
          />

          <Select
            label="Link to Appointment (Optional)"
            options={[
              { label: "-- Unlinked Ticket --", value: "" },
              ...(bookingsData || []).map((b: any) => ({
                label: `${b.preferredDate} - ${b.problemDescription.slice(0, 30)}...`,
                value: b.id,
              })),
            ]}
            value={ticketBookingId}
            onChange={(e: any) => setTicketBookingId(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display text-muted">Problem details</label>
            <textarea
              rows={4}
              placeholder="Provide logs, details, or diagnostics regarding the support request..."
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text outline-none"
            />
          </div>

          <Button variant="primary" type="submit" isLoading={createTicketMutation.isPending} className="w-full mt-4">
            Open Support Ticket
          </Button>
        </form>
      </Modal>

      {/* TICKET CONVERSATION MODAL */}
      <Modal isOpen={!!openTicketId} onClose={() => setOpenTicketId(null)} title={ticketThreadData?.ticket?.subject || "Support Conversation"}>
        <div className="flex flex-col h-[400px] justify-between font-body">
          {/* Scrollable messages area */}
          <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-3.5 mb-4">
            {ticketThreadData?.messages?.map((msg: any) => {
              const isMe = msg.senderId === userProfile?.user?.id;
              return (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  <span className="text-[10px] text-muted flex items-center gap-1 mb-1">
                    <User size={10} className={isMe ? "text-secondary" : "text-primary"} />
                    {msg.senderName} ({msg.senderRole})
                  </span>
                  <div
                    className={`p-3 rounded-xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-secondary/15 text-text border border-[#8B5CF6]/30 rounded-tr-none"
                        : "bg-surface text-text border border-border rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-muted/60 mt-1">{formatDateTime(msg.createdAt)}</span>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex gap-2 border-t border-border/50 pt-4 mt-auto">
            <Input
              placeholder="Type your message to support..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              required
              className="py-2.5"
            />
            <Button variant="primary" type="submit" isLoading={sendReplyMutation.isPending} className="px-4 py-2.5">
              <Send size={16} />
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};
