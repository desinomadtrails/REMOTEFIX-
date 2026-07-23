import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Calendar, CreditCard, LifeBuoy, FileText, Send, User, Trash2, ShieldCheck } from "lucide-react";
import { Button, Card, Badge, Modal, Input, Select } from "@remotefix/ui";
import { api } from "../api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";
export const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState("bookings");
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    // Modal States
    const [payInvoiceId, setPayInvoiceId] = useState(null);
    const [payAmount, setPayAmount] = useState(0);
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [openTicketId, setOpenTicketId] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [newTicketOpen, setNewTicketOpen] = useState(false);
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketDescription, setTicketDescription] = useState("");
    const [ticketPriority, setTicketPriority] = useState("medium");
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
            if (!openTicketId)
                return null;
            return api.getTicketById(openTicketId);
        },
        enabled: !!openTicketId,
    });
    // Mutations
    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId) => api.updateBookingStatus(bookingId, { status: "cancelled" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
    const submitPaymentMutation = useMutation({
        mutationFn: (paymentPayload) => api.submitPayment(paymentPayload),
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
        mutationFn: (payload) => api.sendTicketMessage(payload.ticketId, payload.message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket-thread", openTicketId] });
            setReplyMessage("");
        },
    });
    const createTicketMutation = useMutation({
        mutationFn: (payload) => api.createTicket(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            setNewTicketOpen(false);
            setTicketSubject("");
            setTicketDescription("");
            setTicketBookingId("");
        },
    });
    // Helpers
    const handlePayment = (e) => {
        e.preventDefault();
        if (!payInvoiceId || !cardNumber || !cardExpiry || !cardCvv)
            return;
        submitPaymentMutation.mutate({
            invoiceId: payInvoiceId,
            paymentMethod: "Credit Card",
            transactionId: `TXN-${Date.now().toString().slice(-8)}`,
            amount: payAmount,
        });
    };
    const handleSendReply = (e) => {
        e.preventDefault();
        if (!openTicketId || !replyMessage.trim())
            return;
        sendReplyMutation.mutate({ ticketId: openTicketId, message: replyMessage });
    };
    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!ticketSubject || !ticketDescription)
            return;
        createTicketMutation.mutate({
            subject: ticketSubject,
            description: ticketDescription,
            priority: ticketPriority,
            bookingId: ticketBookingId || undefined,
        });
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-border/40 pb-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-black font-display text-text", children: ["Welcome, ", userProfile?.user?.fullName || "Valued Customer"] }), _jsxs("p", { className: "text-sm text-muted font-body mt-1", children: ["Account: ", _jsx("span", { className: "font-semibold text-text", children: userProfile?.user?.email }), " (Role: ", userProfile?.user?.role, ")"] })] }), _jsx(Button, { variant: "primary", onClick: () => navigate("/book"), children: "Book New Incident" })] }), _jsxs("div", { className: "flex gap-4 border-b border-border/40 pb-4 mb-8 justify-start sm:justify-start", children: [_jsxs("button", { onClick: () => setActiveTab("bookings"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "bookings"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-text"}`, children: [_jsx(Calendar, { size: 16 }), "Appointments"] }), _jsxs("button", { onClick: () => setActiveTab("invoices"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "invoices"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-text"}`, children: [_jsx(FileText, { size: 16 }), "Billing & Invoices"] }), _jsxs("button", { onClick: () => setActiveTab("tickets"), className: `flex items-center gap-2 font-display text-sm font-semibold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === "tickets"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-text"}`, children: [_jsx(LifeBuoy, { size: 16 }), "Support Tickets"] })] }), activeTab === "bookings" && (_jsx("div", { children: bookingsLoading ? (_jsx("div", { className: "text-center py-12", children: "Loading appointments..." })) : !bookingsData || bookingsData.length === 0 ? (_jsx(Card, { className: "text-center py-12 text-muted font-body", children: "No appointments registered. Click \"Book New Incident\" to start." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: bookingsData.map((booking) => (_jsxs(Card, { glowColor: "none", className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-xs text-muted font-body block uppercase tracking-wider", children: ["Type: ", booking.type] }), _jsxs("h3", { className: "text-lg font-bold font-display text-text mt-0.5", children: [booking.problemDescription.slice(0, 50), "..."] })] }), _jsx(Badge, { variant: booking.status === "completed"
                                            ? "success"
                                            : booking.status === "cancelled"
                                                ? "danger"
                                                : booking.status === "in_progress"
                                                    ? "info"
                                                    : "warning", glow: true, children: booking.status })] }), _jsxs("div", { className: "font-body text-xs text-muted space-y-1", children: [_jsxs("div", { children: ["Date: ", _jsx("span", { className: "text-text font-semibold", children: booking.preferredDate })] }), _jsxs("div", { children: ["Time slot: ", _jsx("span", { className: "text-text font-semibold", children: booking.preferredTime })] }), _jsxs("div", { children: ["Operating System: ", _jsx("span", { className: "text-text font-semibold", children: booking.operatingSystem })] }), booking.address && _jsxs("div", { children: ["Location: ", _jsx("span", { className: "text-text font-semibold", children: booking.address })] })] }), booking.status === "pending" && (_jsxs(Button, { variant: "ghost", size: "sm", className: "text-danger hover:bg-danger/10 flex items-center justify-center gap-1 mt-2 w-full", onClick: () => cancelBookingMutation.mutate(booking.id), isLoading: cancelBookingMutation.isPending, children: [_jsx(Trash2, { size: 14 }), "Cancel Appointment"] }))] }, booking.id))) })) })), activeTab === "invoices" && (_jsx("div", { children: invoicesLoading ? (_jsx("div", { className: "text-center py-12", children: "Loading invoices..." })) : !invoicesData || invoicesData.length === 0 ? (_jsx(Card, { className: "text-center py-12 text-muted font-body", children: "No bills or invoices issued yet." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: invoicesData.map((inv) => (_jsxs(Card, { glowColor: "none", className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-xs text-primary font-display font-semibold tracking-wide uppercase", children: ["Invoice No: ", inv.invoiceNumber] }), _jsx("div", { className: "text-2xl font-black font-display text-text mt-1", children: formatCurrency(parseFloat(inv.amount)) })] }), _jsx(Badge, { variant: inv.status === "paid" ? "success" : "warning", glow: true, children: inv.status })] }), _jsxs("div", { className: "text-xs text-muted font-body mt-2", children: ["Issued: ", formatDateTime(inv.createdAt)] }), inv.status === "unpaid" && (_jsxs(Button, { variant: "primary", size: "sm", className: "w-full flex items-center justify-center gap-2 mt-4", onClick: () => {
                                    setPayInvoiceId(inv.id);
                                    setPayAmount(parseFloat(inv.amount));
                                }, children: [_jsx(CreditCard, { size: 14 }), "Pay Invoice"] }))] }, inv.id))) })) })), activeTab === "tickets" && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold font-display text-text", children: "Customer Tickets" }), _jsx(Button, { variant: "cyber", size: "sm", onClick: () => setNewTicketOpen(true), children: "Open Support Ticket" })] }), ticketsLoading ? (_jsx("div", { className: "text-center py-12", children: "Loading tickets..." })) : !ticketsData || ticketsData.length === 0 ? (_jsx(Card, { className: "text-center py-12 text-muted font-body", children: "No support tickets opened." })) : (_jsx("div", { className: "flex flex-col gap-4", children: ticketsData.map((ticket) => (_jsxs(Card, { className: "p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-primary/30", onClick: () => setOpenTicketId(ticket.id), children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-muted font-body", children: ["Ticket ID: ", ticket.id.slice(0, 8)] }), _jsx(Badge, { variant: ticket.priority === "urgent" || ticket.priority === "high" ? "danger" : "muted", className: "py-0", children: ticket.priority })] }), _jsx("h3", { className: "text-base font-bold font-display text-text mt-1", children: ticket.subject })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { variant: ticket.status === "resolved" || ticket.status === "closed" ? "success" : "warning", children: ticket.status }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-xs", children: "View Messages" })] })] }, ticket.id))) }))] })), _jsx(Modal, { isOpen: !!payInvoiceId, onClose: () => setPayInvoiceId(null), title: "Secure Payment Gateway", children: _jsxs("form", { onSubmit: handlePayment, className: "flex flex-col gap-4 font-body", children: [_jsxs("div", { className: "text-center bg-[#111827]/40 p-4 border border-border rounded-lg mb-2", children: [_jsx("span", { className: "text-xs text-muted block uppercase", children: "Amount to pay" }), _jsx("span", { className: "text-3xl font-black font-display text-primary", children: formatCurrency(payAmount) })] }), _jsx(Input, { label: "Cardholder Name", placeholder: "John Doe", required: true }), _jsx(Input, { label: "Credit Card Number", placeholder: "4111 2222 3333 4444", value: cardNumber, onChange: (e) => setCardNumber(e.target.value), maxLength: 19, required: true }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Expiry (MM/YY)", placeholder: "12/28", value: cardExpiry, onChange: (e) => setCardExpiry(e.target.value), maxLength: 5, required: true }), _jsx(Input, { label: "Security Code (CVV)", type: "password", placeholder: "123", value: cardCvv, onChange: (e) => setCardCvv(e.target.value), maxLength: 3, required: true })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted mt-2", children: [_jsx(ShieldCheck, { size: 16, className: "text-success" }), "Connections are protected using 256-bit TLS secure encryption."] }), _jsx(Button, { variant: "primary", type: "submit", isLoading: submitPaymentMutation.isPending, className: "w-full mt-4", children: "Authorize Transaction" })] }) }), _jsx(Modal, { isOpen: newTicketOpen, onClose: () => setNewTicketOpen(false), title: "Open Support Ticket", children: _jsxs("form", { onSubmit: handleCreateTicket, className: "flex flex-col gap-4 font-body", children: [_jsx(Input, { label: "Subject", placeholder: "Issue summary (e.g. WiFi keeps disconnecting)", value: ticketSubject, onChange: (e) => setTicketSubject(e.target.value), required: true }), _jsx(Select, { label: "Priority Level", options: [
                                { label: "Low", value: "low" },
                                { label: "Medium", value: "medium" },
                                { label: "High", value: "high" },
                                { label: "Urgent", value: "urgent" },
                            ], value: ticketPriority, onChange: (e) => setTicketPriority(e.target.value) }), _jsx(Select, { label: "Link to Appointment (Optional)", options: [
                                { label: "-- Unlinked Ticket --", value: "" },
                                ...(bookingsData || []).map((b) => ({
                                    label: `${b.preferredDate} - ${b.problemDescription.slice(0, 30)}...`,
                                    value: b.id,
                                })),
                            ], value: ticketBookingId, onChange: (e) => setTicketBookingId(e.target.value) }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-sm font-medium font-display text-muted", children: "Problem details" }), _jsx("textarea", { rows: 4, placeholder: "Provide logs, details, or diagnostics regarding the support request...", value: ticketDescription, onChange: (e) => setTicketDescription(e.target.value), required: true, className: "w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text outline-none" })] }), _jsx(Button, { variant: "primary", type: "submit", isLoading: createTicketMutation.isPending, className: "w-full mt-4", children: "Open Support Ticket" })] }) }), _jsx(Modal, { isOpen: !!openTicketId, onClose: () => setOpenTicketId(null), title: ticketThreadData?.ticket?.subject || "Support Conversation", children: _jsxs("div", { className: "flex flex-col h-[400px] justify-between font-body", children: [_jsx("div", { className: "flex-grow overflow-y-auto pr-2 flex flex-col gap-3.5 mb-4", children: ticketThreadData?.messages?.map((msg) => {
                                const isMe = msg.senderId === userProfile?.user?.id;
                                return (_jsxs("div", { className: `flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`, children: [_jsxs("span", { className: "text-[10px] text-muted flex items-center gap-1 mb-1", children: [_jsx(User, { size: 10, className: isMe ? "text-secondary" : "text-primary" }), msg.senderName, " (", msg.senderRole, ")"] }), _jsx("div", { className: `p-3 rounded-xl text-sm leading-relaxed ${isMe
                                                ? "bg-secondary/15 text-text border border-[#8B5CF6]/30 rounded-tr-none"
                                                : "bg-surface text-text border border-border rounded-tl-none"}`, children: msg.message }), _jsx("span", { className: "text-[9px] text-muted/60 mt-1", children: formatDateTime(msg.createdAt) })] }, msg.id));
                            }) }), _jsxs("form", { onSubmit: handleSendReply, className: "flex gap-2 border-t border-border/50 pt-4 mt-auto", children: [_jsx(Input, { placeholder: "Type your message to support...", value: replyMessage, onChange: (e) => setReplyMessage(e.target.value), required: true, className: "py-2.5" }), _jsx(Button, { variant: "primary", type: "submit", isLoading: sendReplyMutation.isPending, className: "px-4 py-2.5", children: _jsx(Send, { size: 16 }) })] })] }) })] }));
};
//# sourceMappingURL=CustomerDashboard.js.map