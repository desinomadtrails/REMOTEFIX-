import React, { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, MapPin, Calendar, Clock, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button, Card, Input } from "@remotefix/ui";
import { api } from "../services/api.js";

export const TrackService: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get("ticketId") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trackData, setTrackData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !phone) {
      setErrorMsg("Please enter both Ticket ID and Mobile Number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setTrackData(null);

    try {
      const res = await api.trackServiceRequest(ticketId, phone);
      if (res.success) {
        setTrackData(res);
        setSearchParams({ ticketId, phone });
      } else {
        setErrorMsg(res.error || "Failed to retrieve request status.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "No matching request found for this Ticket ID and Mobile Number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-body">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-display text-text">Track Your Service Request</h1>
        <p className="text-sm text-muted mt-2">
          Enter your Ticket ID and registered mobile number to check real-time progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tracking Input Card */}
        <div className="lg:col-span-4">
          <Card glowColor="cyan" className="p-6">
            <form onSubmit={handleTrack} className="flex flex-col gap-4">
              <Input
                label="Ticket ID"
                placeholder="e.g. RF-20260727-000127"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                required
              />
              <Input
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              
              {errorMsg && (
                <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded p-2.5 mt-2">
                  {errorMsg}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-2"
                isLoading={loading}
                glow
              >
                <Search size={16} />
                Lookup Request
              </Button>
            </form>
          </Card>
        </div>

        {/* Tracking Details & Timeline */}
        <div className="lg:col-span-8">
          {trackData ? (
            <div className="flex flex-col gap-6">
              {/* Request Details Header */}
              <Card className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-3 gap-2">
                  <div>
                    <span className="text-xs text-muted uppercase">Ticket Details</span>
                    <h2 className="text-xl font-bold font-display text-text">{trackData.booking.ticketId}</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border self-start ${
                    trackData.booking.status === "completed"
                      ? "bg-success/15 border-success/30 text-success"
                      : trackData.booking.status === "cancelled"
                      ? "bg-danger/15 border-danger/30 text-danger"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    {trackData.booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted block text-xs">Device Class</span>
                    <span className="font-semibold text-text">{trackData.booking.device}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Priority</span>
                    <span className="font-semibold text-text uppercase">{trackData.booking.priority}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <span className="text-muted block text-xs">Visit Date</span>
                      <span className="font-semibold text-text">{trackData.booking.visitDate}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <span className="text-muted block text-xs">Time Slot</span>
                      <span className="font-semibold text-text">{trackData.booking.visitTime}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mt-2">
                  <span className="text-muted block text-xs">Problem Description</span>
                  <p className="text-text text-sm leading-relaxed mt-1 bg-[#111827]/40 p-3 rounded-lg border border-border/50">
                    {trackData.booking.problemDescription}
                  </p>
                </div>
              </Card>

              {/* Status Timeline Card */}
              <Card>
                <h3 className="text-lg font-bold font-display text-text border-b border-border/50 pb-3 mb-6">
                  Service Request Timeline
                </h3>
                
                <div className="relative pl-6 border-l-2 border-border/50 flex flex-col gap-8 ml-2">
                  {trackData.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 bg-[#030712] transition-colors ${
                        step.isCompleted
                          ? "border-primary bg-primary/20 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                          : "border-border bg-surface"
                      }`} />
                      
                      <div>
                        <h4 className={`text-sm font-bold font-display ${step.isCompleted ? "text-text" : "text-muted"}`}>
                          {step.stage}
                        </h4>
                        {step.date && (
                          <span className="text-[10px] text-muted block mt-0.5">
                            {new Date(step.date).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Assigned Technician Card */}
              {trackData.technician && (
                <Card className="flex items-center gap-4 relative overflow-hidden" glowColor="cyan">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 -translate-y-8 blur-md" />
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted block">Assigned Technician</span>
                    <h4 className="text-base font-bold font-display text-text">{trackData.technician.name}</h4>
                    <p className="text-xs text-muted leading-relaxed mt-1 max-w-md">
                      {trackData.technician.bio || "Field systems technician dispatched to service your device hardware."}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="border border-border/40 bg-[#111827]/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <ShieldAlert className="w-12 h-12 text-muted mb-4 animate-pulse" />
              <h3 className="text-lg font-bold font-display text-text">No Lookup Active</h3>
              <p className="text-xs text-muted max-w-xs mt-1 leading-relaxed">
                Enter your Ticket ID and Mobile Number on the left to display real-time tracking details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
