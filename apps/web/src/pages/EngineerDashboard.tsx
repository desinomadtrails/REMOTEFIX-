import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  FileText, 
  Image as ImageIcon,
  Clock,
  Calendar,
  AlertTriangle,
  ClipboardList,
  Cpu
} from "lucide-react";
import { Button, Card, Badge, Input, GlowDivider, Modal } from "@remotefix/ui";
import { api } from "../services/api.js";
import { formatCurrency, formatDateTime } from "@remotefix/utils";

export const EngineerDashboard: React.FC = () => {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Job Completion / Remarks & Parts States
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [remarksText, setRemarksText] = useState("");
  const [partsUsedText, setPartsUsedText] = useState("");

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
    mutationFn: (payload: { id: string; status: string; remarks?: string; partsUsed?: string }) =>
      api.updateBookingStatus(payload.id, { 
        status: payload.status, 
        remarks: payload.remarks, 
        partsUsed: payload.partsUsed 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engineer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-detail", selectedBookingId] });
      setCompleteModalOpen(false);
      setRemarksText("");
      setPartsUsedText("");
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
      if (selectedBookingId) {
        queryClient.invalidateQueries({ queryKey: ["booking-detail", selectedBookingId] });
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to upload photo.");
    },
  });

  // Query details for active images, remarks, and parts
  const { data: selectedBookingDetail } = useQuery({
    queryKey: ["booking-detail", selectedBookingId],
    queryFn: () => {
      if (!selectedBookingId) return null;
      return api.getBookingById(selectedBookingId);
    },
    enabled: !!selectedBookingId,
  });

  // Today's Date String (YYYY-MM-DD)
  const todayString = new Date().toISOString().split("T")[0];

  // Today's jobs vs all jobs
  const todayJobs = (bookingsData || []).filter((b: any) => b.preferredDate === todayString);
  const otherJobs = (bookingsData || []).filter((b: any) => b.preferredDate !== todayString);

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

  const handleCompleteJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    updateStatusMutation.mutate({
      id: selectedBookingId,
      status: "completed",
      remarks: remarksText || undefined,
      partsUsed: partsUsedText || undefined
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body">
      {/* Header */}
      <div className="border-b border-border/40 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-text flex items-center gap-2">
            <Wrench className="text-primary animate-pulse shrink-0" />
            Engineer Dispatch Desk
          </h1>
          <p className="text-sm text-muted mt-1">
            Review your assigned IT repairs, update active status trackers, and upload proof of diagnostics.
          </p>
        </div>

        {/* Today's count banner */}
        <div className="bg-[#111827]/60 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
          <Clock className="text-primary w-5 h-5" />
          <div className="text-xs">
            <span className="text-muted block">Today's Schedule</span>
            <span className="font-bold text-text font-display text-sm">{todayJobs.length} active tasks</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-4 mb-6">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Assigned list */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Today's tasks */}
          <div>
            <h2 className="text-sm font-bold font-display text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={14} />
              Today's Task Schedule
            </h2>
            
            {bookingsLoading ? (
              <div className="text-xs text-muted">Loading schedule...</div>
            ) : todayJobs.length === 0 ? (
              <p className="text-xs text-muted italic bg-[#111827]/30 border border-border/40 p-4 rounded-xl">No tasks scheduled for today.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {todayJobs.map((b: any) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedBookingId === b.id
                        ? "bg-primary/15 border-primary text-text shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                        : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wide text-primary">
                        {b.ticketId || "GUEST"}
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
                    <h4 className="text-sm font-semibold font-display text-text truncate">
                      {b.problemDescription}
                    </h4>
                    <div className="text-[10px] mt-2 flex justify-between">
                      <span>OS: {b.operatingSystem || "Hardware"}</span>
                      <span>Time: {b.preferredTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <GlowDivider color="cyan" className="my-1" />

          {/* Other/Upcoming tasks */}
          <div>
            <h2 className="text-sm font-bold font-display text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <ClipboardList size={14} />
              Upcoming Schedule
            </h2>

            {bookingsLoading ? (
              <div className="text-xs text-muted">Loading schedule...</div>
            ) : otherJobs.length === 0 ? (
              <p className="text-xs text-muted italic bg-[#111827]/30 border border-border/40 p-4 rounded-xl">No other tasks assigned.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {otherJobs.map((b: any) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedBookingId === b.id
                        ? "bg-primary/15 border-primary text-text shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                        : "bg-[#111827]/50 border-border text-muted hover:border-muted/30 hover:bg-[#111827]/80"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wide">
                        {b.ticketId || "GUEST"}
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
                    <h4 className="text-sm font-semibold font-display text-text truncate">
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
        </div>

        {/* RIGHT: Detail View */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <div className="flex flex-col gap-6">
              {/* Client Profile Card */}
              <Card glowColor="none" className="p-6">
                <div className="flex justify-between items-start border-b border-border/40 pb-4 mb-4">
                  <div>
                    <span className="text-xs text-primary font-mono block">Ticket Ref: {selectedBooking.ticketId || "GUEST"}</span>
                    <h3 className="text-xl font-bold font-display text-text mt-0.5">Incident File</h3>
                  </div>
                  <Badge variant={selectedBooking.status === "completed" ? "success" : "warning"} glow>
                    {selectedBooking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted">
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

                    <div className="flex gap-4">
                      <div>
                        <span className="text-xs block mb-1">Device / Brand</span>
                        <Badge variant="secondary">{selectedBooking.brand ? `${selectedBooking.brand} ${selectedBooking.model}` : "Standard Device"}</Badge>
                      </div>
                      <div>
                        <span className="text-xs block mb-1">Priority</span>
                        <Badge variant={selectedBooking.priority === "emergency" || selectedBooking.priority === "high" ? "danger" : "muted"}>{selectedBooking.priority}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <GlowDivider color="cyan" className="my-6" />

                <div className="text-sm">
                  <span className="block text-xs text-muted mb-1">Incident Fault Log</span>
                  <div className="bg-[#030712]/50 p-4 border border-border rounded-lg text-text leading-relaxed">
                    {selectedBooking.problemDescription}
                  </div>
                </div>

                {/* Show saved technician notes if they exist */}
                {(selectedBookingDetail?.booking?.remarks || selectedBookingDetail?.booking?.partsUsed) && (
                  <div className="mt-6 border-t border-border/40 pt-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBookingDetail.booking.remarks && (
                      <div>
                        <span className="text-xs text-muted block mb-1">Saved Diagnostic Remarks</span>
                        <div className="bg-[#111827]/40 p-3 rounded-lg border border-border/50 text-text text-xs leading-relaxed">
                          {selectedBookingDetail.booking.remarks}
                        </div>
                      </div>
                    )}
                    {selectedBookingDetail.booking.partsUsed && (
                      <div>
                        <span className="text-xs text-muted block mb-1">Saved Parts Used</span>
                        <div className="bg-[#111827]/40 p-3 rounded-lg border border-border/50 text-text text-xs leading-relaxed">
                          {selectedBookingDetail.booking.partsUsed}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                      Start Work
                    </Button>
                    <Button
                      variant={selectedBooking.status === "completed" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setRemarksText(selectedBookingDetail?.booking?.remarks || "");
                        setPartsUsedText(selectedBookingDetail?.booking?.partsUsed || "");
                        setCompleteModalOpen(true);
                      }}
                      isLoading={updateStatusMutation.isPending}
                      glow
                    >
                      Complete Job
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

      {/* JOB COMPLETION MODAL */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Finalize Job & Remarks">
        <form onSubmit={handleCompleteJobSubmit} className="flex flex-col gap-4 font-body">
          <div className="flex items-start gap-2 bg-[#111827]/40 border border-primary/25 rounded-lg p-4 mb-2">
            <AlertTriangle className="text-primary w-5.5 h-5.5 shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              Completing this task notifies the customer and finalizes your diagnostic record. Please enter remarks and parts consumed before submitting.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display text-muted">Technical Remarks</label>
            <textarea
              rows={4}
              placeholder="e.g., Replaced faulty Cat6 cable, verified DNS resolution, updated driver configurations..."
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-lg text-text text-xs outline-none"
            />
          </div>

          <Input
            label="Parts Consumed / Used (Optional)"
            placeholder="e.g. 1TB NVMe SSD, 10m Cat6 Cable"
            value={partsUsedText}
            onChange={(e) => setPartsUsedText(e.target.value)}
          />

          <Button 
            variant="primary" 
            type="submit" 
            isLoading={updateStatusMutation.isPending} 
            className="w-full mt-4"
            glow
          >
            Complete Task &amp; Close File
          </Button>
        </form>
      </Modal>
    </div>
  );
};
