import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wrench, Phone, Mail, MapPin, CheckCircle, ArrowRight, Shield, FileText, Image as ImageIcon } from "lucide-react";
import { Button, Card, Badge, Input, GlowDivider } from "@remotefix/ui";
import { api } from "../services/api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const EngineerDashboard: React.FC = () => {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
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

  const selectedBooking = (bookingsData || []).find((b: any) => b.id === selectedBookingId);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) =>
      api.updateBookingStatus(payload.id, { status: payload.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineer-bookings"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to update status.");
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (payload: { bookingId: string; amount: number }) =>
      api.createInvoice(payload),
    onSuccess: () => {
      setInvoiceSuccess(true);
      setInvoiceAmount("");
      setTimeout(() => setInvoiceSuccess(false), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to emit invoice.");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (payload: { id: string; image: string }) =>
      api.uploadBookingImage(payload.id, payload.image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineer-bookings"] });
      // Invalidate to reload images list inside selected booking
      if (selectedBookingId) {
        queryClient.invalidateQueries({ queryKey: ["booking-detail", selectedBookingId] });
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to upload photo.");
    },
  });

  // Query details for active images
  const { data: selectedBookingDetail } = useQuery({
    queryKey: ["booking-detail", selectedBookingId],
    queryFn: () => {
      if (!selectedBookingId) return null;
      return api.getBookingById(selectedBookingId);
    },
    enabled: !!selectedBookingId,
  });

  // Handlers
  const handleStatusChange = (status: string) => {
    if (!selectedBookingId) return;
    updateStatusMutation.mutate({ id: selectedBookingId, status });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !invoiceAmount) return;
    setErrorMsg("");
    generateInvoiceMutation.mutate({
      bookingId: selectedBookingId,
      amount: parseFloat(invoiceAmount),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBookingId) return;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="border-b border-border/40 pb-6 mb-8">
        <h1 className="text-3xl font-black font-display text-text flex items-center gap-2">
          <Wrench className="text-primary animate-pulse" />
          Engineer Dispatch Desk
        </h1>
        <p className="text-sm text-muted font-body mt-1">
          Review your assigned IT repairs, update active status trackers, and upload proof of diagnostics.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6 font-body">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Assigned list */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <h2 className="text-lg font-bold font-display text-text">Assigned Incidents</h2>
          
          {bookingsLoading ? (
            <div>Loading assigned schedule...</div>
          ) : !bookingsData || bookingsData.length === 0 ? (
            <Card className="text-center py-8 text-muted font-body">
              No active incidents assigned to you.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {bookingsData.map((b: any) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer font-body ${
                    selectedBookingId === b.id
                      ? "bg-primary/10 border-primary/50 text-text"
                      : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wide">
                      Class: {b.type}
                    </span>
                    <Badge
                      variant={
                        b.status === "completed"
                          ? "success"
                          : b.status === "in_progress"
                          ? "info"
                          : "warning"
                      }
                    >
                      {b.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold font-display text-text mt-1 truncate">
                    {b.problemDescription}
                  </h4>
                  <div className="text-[10px] mt-2 flex justify-between">
                    <span>Date: {b.preferredDate}</span>
                    <span>Time: {b.preferredTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Detail View */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <div className="flex flex-col gap-6">
              {/* Client Profile Card */}
              <Card glowColor="none" className="p-6">
                <div className="flex justify-between items-start border-b border-border/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-display text-text">Client File</h3>
                    <span className="text-xs text-muted font-body mt-0.5">Booking ID: {selectedBooking.id}</span>
                  </div>
                  <Badge variant={selectedBooking.status === "completed" ? "success" : "warning"} glow>
                    {selectedBooking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-sm text-muted">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-xs block">Contact Client</span>
                        <span className="text-text font-semibold">{selectedBooking.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-xs block">Phone Number</span>
                        <span className="text-text font-semibold">{selectedBooking.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-xs block">Email Address</span>
                        <span className="text-text font-semibold">{selectedBooking.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-xs block">Dispatch Target</span>
                        <span className="text-text font-semibold leading-relaxed">
                          {selectedBooking.address || "Remote Assistance (No Physical Dispatch)"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs block mb-1">Platform</span>
                      <Badge variant="secondary">{selectedBooking.operatingSystem}</Badge>
                    </div>
                  </div>
                </div>

                <GlowDivider color="cyan" className="my-6" />

                <div className="font-body text-sm">
                  <span className="block text-xs text-muted mb-1">Incident Fault Log</span>
                  <div className="bg-[#030712]/50 p-4 border border-border rounded-lg text-text leading-relaxed">
                    {selectedBooking.problemDescription}
                  </div>
                </div>
              </Card>

              {/* Status Actions & Photo Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status card */}
                <Card className="flex flex-col gap-4">
                  <h4 className="text-base font-bold font-display text-text">Workflow State</h4>
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      variant={selectedBooking.status === "in_progress" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("in_progress")}
                      isLoading={updateStatusMutation.isPending}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={selectedBooking.status === "completed" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("completed")}
                      isLoading={updateStatusMutation.isPending}
                    >
                      Mark Completed
                    </Button>
                  </div>
                </Card>

                {/* Upload Photos card */}
                <Card className="flex flex-col gap-4">
                  <h4 className="text-base font-bold font-display text-text">Upload Diagnostic Images</h4>
                  <div className="border border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-4 flex flex-col items-center justify-center relative bg-[#111827]/30 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <ImageIcon className="w-6 h-6 text-muted mb-1" />
                    <span className="text-xs text-muted">Upload proof-of-work photo</span>
                  </div>

                  {selectedBookingDetail?.booking?.images && selectedBookingDetail.booking.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {selectedBookingDetail.booking.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative w-12 h-12 rounded border border-border overflow-hidden">
                          <img src={img} alt="diagnostic" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Billing Compiler */}
              <Card glowColor="none">
                <h4 className="text-base font-bold font-display text-text mb-4">Emit Customer Invoice</h4>
                {invoiceSuccess ? (
                  <div className="bg-success/15 border border-success/30 text-success text-sm rounded-lg p-4 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Invoice has been compiled and emailed to client successfully!
                  </div>
                ) : (
                  <form onSubmit={handleInvoiceSubmit} className="flex gap-4 items-end font-body">
                    <Input
                      label="Service Total Amount ($)"
                      placeholder="e.g. 150.00"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      required
                      className="max-w-xs"
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      isLoading={generateInvoiceMutation.isPending}
                      className="flex items-center gap-2 h-11"
                    >
                      <FileText size={16} />
                      Dispatch Invoice
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          ) : (
            <Card className="text-center py-20 text-muted font-body">
              Select an assigned incident from the sidebar to review booking details, adjust work states, or dispatch billing.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
