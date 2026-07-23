import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wrench, Phone, Mail, MapPin, CheckCircle, Shield, FileText, Image as ImageIcon } from "lucide-react";
import { Button, Card, Badge, Input, GlowDivider } from "@remotefix/ui";
import { api } from "../api.js";
export const EngineerDashboard = () => {
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [invoiceAmount, setInvoiceAmount] = useState("");
    const [invoiceSuccess, setInvoiceSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const queryClient = useQueryClient();
    // Queries
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ["engineer-bookings"],
        queryFn: async () => {
            const res = await api.getBookings();
            return res.bookings || [];
        },
    });
    const selectedBooking = (bookingsData || []).find((b) => b.id === selectedBookingId);
    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: (payload) => api.updateBookingStatus(payload.id, { status: payload.status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["engineer-bookings"] });
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to update status.");
        },
    });
    const generateInvoiceMutation = useMutation({
        mutationFn: (payload) => api.createInvoice(payload),
        onSuccess: () => {
            setInvoiceSuccess(true);
            setInvoiceAmount("");
            setTimeout(() => setInvoiceSuccess(false), 3000);
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to emit invoice.");
        },
    });
    const uploadPhotoMutation = useMutation({
        mutationFn: (payload) => api.uploadBookingImage(payload.id, payload.image),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["engineer-bookings"] });
            // Invalidate to reload images list inside selected booking
            if (selectedBookingId) {
                queryClient.invalidateQueries({ queryKey: ["booking-detail", selectedBookingId] });
            }
        },
        onError: (err) => {
            setErrorMsg(err.message || "Failed to upload photo.");
        },
    });
    // Query details for active images
    const { data: selectedBookingDetail } = useQuery({
        queryKey: ["booking-detail", selectedBookingId],
        queryFn: () => {
            if (!selectedBookingId)
                return null;
            return api.getBookingById(selectedBookingId);
        },
        enabled: !!selectedBookingId,
    });
    // Handlers
    const handleStatusChange = (status) => {
        if (!selectedBookingId)
            return;
        updateStatusMutation.mutate({ id: selectedBookingId, status });
    };
    const handleInvoiceSubmit = (e) => {
        e.preventDefault();
        if (!selectedBookingId || !invoiceAmount)
            return;
        setErrorMsg("");
        generateInvoiceMutation.mutate({
            bookingId: selectedBookingId,
            amount: parseFloat(invoiceAmount),
        });
    };
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBookingId)
            return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                uploadPhotoMutation.mutate({
                    id: selectedBookingId,
                    image: reader.result,
                });
            }
        };
        reader.readAsDataURL(file);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [_jsxs("div", { className: "border-b border-border/40 pb-6 mb-8", children: [_jsxs("h1", { className: "text-3xl font-black font-display text-text flex items-center gap-2", children: [_jsx(Wrench, { className: "text-primary animate-pulse" }), "Engineer Dispatch Desk"] }), _jsx("p", { className: "text-sm text-muted font-body mt-1", children: "Review your assigned IT repairs, update active status trackers, and upload proof of diagnostics." })] }), errorMsg && (_jsx("div", { className: "bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body", children: errorMsg })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "flex flex-col gap-4 lg:col-span-1", children: [_jsx("h2", { className: "text-lg font-bold font-display text-text", children: "Assigned Incidents" }), bookingsLoading ? (_jsx("div", { children: "Loading assigned schedule..." })) : !bookingsData || bookingsData.length === 0 ? (_jsx(Card, { className: "text-center py-8 text-muted font-body", children: "No active incidents assigned to you." })) : (_jsx("div", { className: "flex flex-col gap-3", children: bookingsData.map((b) => (_jsxs("div", { onClick: () => setSelectedBookingId(b.id), className: `p-4 rounded-xl border transition-all cursor-pointer font-body ${selectedBookingId === b.id
                                        ? "bg-primary/10 border-primary/50 text-text"
                                        : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"}`, children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsxs("span", { className: "text-[10px] uppercase font-bold tracking-wide", children: ["Class: ", b.type] }), _jsx(Badge, { variant: b.status === "completed"
                                                        ? "success"
                                                        : b.status === "in_progress"
                                                            ? "info"
                                                            : "warning", children: b.status })] }), _jsx("h4", { className: "text-sm font-semibold font-display text-text mt-1 truncate", children: b.problemDescription }), _jsxs("div", { className: "text-[10px] mt-2 flex justify-between", children: [_jsxs("span", { children: ["Date: ", b.preferredDate] }), _jsxs("span", { children: ["Time: ", b.preferredTime] })] })] }, b.id))) }))] }), _jsx("div", { className: "lg:col-span-2", children: selectedBooking ? (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs(Card, { glowColor: "none", className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start border-b border-border/40 pb-4 mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold font-display text-text", children: "Client File" }), _jsxs("span", { className: "text-xs text-muted font-body mt-0.5", children: ["Booking ID: ", selectedBooking.id] })] }), _jsx(Badge, { variant: selectedBooking.status === "completed" ? "success" : "warning", glow: true, children: selectedBooking.status })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-sm text-muted", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Shield, { className: "w-4 h-4 text-primary shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs block", children: "Contact Client" }), _jsx("span", { className: "text-text font-semibold", children: selectedBooking.name })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Phone, { className: "w-4 h-4 text-primary shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs block", children: "Phone Number" }), _jsx("span", { className: "text-text font-semibold", children: selectedBooking.phone })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Mail, { className: "w-4 h-4 text-primary shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs block", children: "Email Address" }), _jsx("span", { className: "text-text font-semibold", children: selectedBooking.email })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-xs block", children: "Dispatch Target" }), _jsx("span", { className: "text-text font-semibold leading-relaxed", children: selectedBooking.address || "Remote Assistance (No Physical Dispatch)" })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs block mb-1", children: "Platform" }), _jsx(Badge, { variant: "secondary", children: selectedBooking.operatingSystem })] })] })] }), _jsx(GlowDivider, { color: "cyan", className: "my-6" }), _jsxs("div", { className: "font-body text-sm", children: [_jsx("span", { className: "block text-xs text-muted mb-1", children: "Incident Fault Log" }), _jsx("div", { className: "bg-[#030712]/50 p-4 border border-border rounded-lg text-text leading-relaxed", children: selectedBooking.problemDescription })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "flex flex-col gap-4", children: [_jsx("h4", { className: "text-base font-bold font-display text-text", children: "Workflow State" }), _jsxs("div", { className: "flex flex-wrap gap-2.5", children: [_jsx(Button, { variant: selectedBooking.status === "in_progress" ? "primary" : "outline", size: "sm", onClick: () => handleStatusChange("in_progress"), isLoading: updateStatusMutation.isPending, children: "In Progress" }), _jsx(Button, { variant: selectedBooking.status === "completed" ? "primary" : "outline", size: "sm", onClick: () => handleStatusChange("completed"), isLoading: updateStatusMutation.isPending, children: "Mark Completed" })] })] }), _jsxs(Card, { className: "flex flex-col gap-4", children: [_jsx("h4", { className: "text-base font-bold font-display text-text", children: "Upload Diagnostic Images" }), _jsxs("div", { className: "border border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-4 flex flex-col items-center justify-center relative bg-[#111827]/30 cursor-pointer", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handlePhotoUpload, className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full" }), _jsx(ImageIcon, { className: "w-6 h-6 text-muted mb-1" }), _jsx("span", { className: "text-xs text-muted", children: "Upload proof-of-work photo" })] }), selectedBookingDetail?.booking?.images && selectedBookingDetail.booking.images.length > 0 && (_jsx("div", { className: "flex gap-2 flex-wrap", children: selectedBookingDetail.booking.images.map((img, idx) => (_jsx("div", { className: "relative w-12 h-12 rounded border border-border overflow-hidden", children: _jsx("img", { src: img, alt: "diagnostic", className: "w-full h-full object-cover" }) }, idx))) }))] })] }), _jsxs(Card, { glowColor: "none", children: [_jsx("h4", { className: "text-base font-bold font-display text-text mb-4", children: "Emit Customer Invoice" }), invoiceSuccess ? (_jsxs("div", { className: "bg-success/15 border border-success/30 text-success text-sm rounded-lg p-4 flex items-center gap-2", children: [_jsx(CheckCircle, { size: 18 }), "Invoice has been compiled and emailed to client successfully!"] })) : (_jsxs("form", { onSubmit: handleInvoiceSubmit, className: "flex gap-4 items-end font-body", children: [_jsx(Input, { label: "Service Total Amount ($)", placeholder: "e.g. 150.00", value: invoiceAmount, onChange: (e) => setInvoiceAmount(e.target.value), required: true, className: "max-w-xs" }), _jsxs(Button, { variant: "primary", type: "submit", isLoading: generateInvoiceMutation.isPending, className: "flex items-center gap-2 h-11", children: [_jsx(FileText, { size: 16 }), "Dispatch Invoice"] })] }))] })] })) : (_jsx(Card, { className: "text-center py-20 text-muted font-body", children: "Select an assigned incident from the sidebar to review booking details, adjust work states, or dispatch billing." })) })] })] }));
};
//# sourceMappingURL=EngineerDashboard.js.map