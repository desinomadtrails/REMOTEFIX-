import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Card, Badge, Input } from "@remotefix/ui";
import { MapPin, Navigation, Clock, Camera, CheckCircle2, Shield, Play, Square, Save, RotateCcw } from "lucide-react";
import { api } from "../../api.js";

interface TechnicianWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess?: () => void;
}

export const TechnicianWorkflowModal: React.FC<TechnicianWorkflowModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"checkin" | "photos" | "signature" | "checkout">("checkin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // GPS State
  const [checkInGps, setCheckInGps] = useState<{ lat: number; lng: number } | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Photo uploads
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  // Signature state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Work timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Final Checkout remarks
  const [remarks, setRemarks] = useState(booking?.remarks || "");
  const [partsUsed, setPartsUsed] = useState(booking?.partsUsed || "");

  // Load existing work log if present
  useEffect(() => {
    if (booking?.id && isOpen) {
      api.getTechnicianWorkLog(booking.id).then((res: any) => {
        if (res?.workLog) {
          const log = res.workLog;
          if (log.checkInTime) {
            setCheckInTime(log.checkInTime);
            setIsTimerRunning(!log.checkOutTime);
            const startMs = new Date(log.checkInTime).getTime();
            const endMs = log.checkOutTime ? new Date(log.checkOutTime).getTime() : Date.now();
            setElapsedSeconds(Math.max(0, Math.floor((endMs - startMs) / 1000)));
          }
          if (log.checkInLat && log.checkInLng) {
            setCheckInGps({ lat: parseFloat(log.checkInLat), lng: parseFloat(log.checkInLng) });
          }
          if (log.beforePhotos) setBeforePhotos(log.beforePhotos);
          if (log.afterPhotos) setAfterPhotos(log.afterPhotos);
          if (log.digitalSignatureUrl) setSignatureData(log.digitalSignatureUrl);
        }
      }).catch(() => {});
    }
  }, [booking, isOpen]);

  // Timer counter
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // GPS Check-In handler
  const handleCheckIn = () => {
    setLoading(true);
    setMessage(null);

    const performCheckIn = (lat?: number, lng?: number) => {
      api.technicianCheckIn(booking.id, lat, lng)
        .then((res: any) => {
          setCheckInTime(res.checkInTime);
          if (lat && lng) setCheckInGps({ lat, lng });
          setIsTimerRunning(true);
          setMessage({ type: "success", text: "Checked in successfully! Work timer started." });
          if (onSuccess) onSuccess();
        })
        .catch((err: any) => {
          setMessage({ type: "error", text: err.message || "Failed to check in." });
        })
        .finally(() => setLoading(false));
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => performCheckIn(pos.coords.latitude, pos.coords.longitude),
        () => performCheckIn(), // Fallback without GPS if permission denied
        { timeout: 5000 }
      );
    } else {
      performCheckIn();
    }
  };

  // Photo uploader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          if (type === "before") setBeforePhotos((prev) => [...prev, reader.result as string]);
          else setAfterPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Canvas drawing handlers for Digital Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureData(null);
  };

  // Save work assets
  const handleSaveAssets = () => {
    setLoading(true);
    setMessage(null);

    api.uploadWorkAssets({
      bookingId: booking.id,
      beforePhotos,
      afterPhotos,
      digitalSignature: signatureData || undefined,
      notes: remarks,
    })
      .then(() => setMessage({ type: "success", text: "Before/After photos and digital signature saved." }))
      .catch((err: any) => setMessage({ type: "error", text: err.message || "Failed to save assets." }))
      .finally(() => setLoading(false));
  };

  // Final Check-Out
  const handleCheckOut = () => {
    setLoading(true);
    setMessage(null);

    const performCheckOut = (lat?: number, lng?: number) => {
      api.technicianCheckOut(booking.id, lat, lng, remarks, partsUsed)
        .then((res: any) => {
          setIsTimerRunning(false);
          setMessage({ type: "success", text: `Job completed! Total duration: ${res.totalMinutes} minutes.` });
          if (onSuccess) onSuccess();
          setTimeout(() => onClose(), 2000);
        })
        .catch((err: any) => setMessage({ type: "error", text: err.message || "Failed to check out." }))
        .finally(() => setLoading(false));
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => performCheckOut(pos.coords.latitude, pos.coords.longitude),
        () => performCheckOut(),
        { timeout: 5000 }
      );
    } else {
      performCheckOut();
    }
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const openGpsNavigation = () => {
    const addressQuery = encodeURIComponent(booking.address || `${booking.city || ""} ${booking.state || ""}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, "_blank");
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Technician Field Workflow — ${booking.ticketId || "Job"}`}>
      <div className="font-body space-y-4">
        {/* Navigation & Header Summary */}
        <div className="bg-[#111827]/60 border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-text">{booking.name}</span>
              <Badge variant={booking.status === "completed" ? "success" : "warning"} className="text-[9px]">
                {booking.status}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5 max-w-sm truncate">📍 {booking.address || "On-site dispatch"}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {booking.address && (
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1 text-primary border-primary/30" onClick={openGpsNavigation}>
                <Navigation size={13} /> GPS Maps
              </Button>
            )}
            <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-xs font-bold text-primary">
              <Clock size={14} className={isTimerRunning ? "animate-spin text-secondary" : ""} />
              {formatTimer(elapsedSeconds)}
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs font-semibold ${message.type === "success" ? "bg-success/15 border border-success/30 text-success" : "bg-danger/15 border border-danger/30 text-danger"}`}>
            {message.text}
          </div>
        )}

        {/* Workflow Tab Navigation */}
        <div className="flex border-b border-border/30 gap-2 pb-0">
          {[
            { id: "checkin", label: "1. GPS Check-In", icon: <MapPin size={13} /> },
            { id: "photos", label: "2. Work Photos", icon: <Camera size={13} /> },
            { id: "signature", label: "3. Signature", icon: <Save size={13} /> },
            { id: "checkout", label: "4. Check-Out", icon: <CheckCircle2 size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 text-xs font-semibold font-display px-3 py-2 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-secondary text-secondary bg-secondary/5 rounded-t-lg"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GPS CHECK-IN */}
        {activeTab === "checkin" && (
          <div className="space-y-4 py-2">
            <Card glowColor="none" className="p-5 text-center flex flex-col items-center gap-3">
              <MapPin size={32} className="text-secondary animate-bounce" />
              <div>
                <h3 className="text-base font-bold font-display text-text">Technician Site Check-In</h3>
                <p className="text-xs text-muted max-w-sm mt-1">
                  Record your arrival timestamp and GPS coordinates for client transparency and SLA compliance.
                </p>
              </div>

              {checkInTime ? (
                <div className="bg-success/10 border border-success/20 p-3 rounded-xl w-full text-xs space-y-1">
                  <div className="font-semibold text-success flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Checked In Active
                  </div>
                  <div className="text-muted">Time: {new Date(checkInTime).toLocaleString()}</div>
                  {checkInGps && <div className="text-muted font-mono">GPS: {checkInGps.lat.toFixed(5)}, {checkInGps.lng.toFixed(5)}</div>}
                </div>
              ) : (
                <Button variant="primary" glow className="w-full flex items-center justify-center gap-2" onClick={handleCheckIn} isLoading={loading}>
                  <Play size={15} /> Confirm Arrival &amp; Start Timer
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: BEFORE / AFTER PHOTOS */}
        {activeTab === "photos" && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card glowColor="none" className="p-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold font-display text-text uppercase flex items-center gap-1.5">
                  <Camera size={13} className="text-secondary" /> Before Repair Photos ({beforePhotos.length})
                </h4>
                <div className="border border-dashed border-border p-4 rounded-lg text-center relative cursor-pointer bg-white/3">
                  <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, "before")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="text-xs text-muted">Click to add initial device photos</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {beforePhotos.map((img, i) => (
                    <img key={i} src={img} alt="before" className="w-14 h-14 object-cover rounded border border-border" />
                  ))}
                </div>
              </Card>

              <Card glowColor="none" className="p-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold font-display text-text uppercase flex items-center gap-1.5">
                  <Camera size={13} className="text-success" /> After Repair Photos ({afterPhotos.length})
                </h4>
                <div className="border border-dashed border-border p-4 rounded-lg text-center relative cursor-pointer bg-white/3">
                  <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, "after")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <span className="text-xs text-muted">Click to add completed repair photos</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {afterPhotos.map((img, i) => (
                    <img key={i} src={img} alt="after" className="w-14 h-14 object-cover rounded border border-border" />
                  ))}
                </div>
              </Card>
            </div>

            <Button variant="cyber" size="sm" className="w-full text-xs" onClick={handleSaveAssets} isLoading={loading}>
              Save Photos to Job Record
            </Button>
          </div>
        )}

        {/* TAB 3: DIGITAL SIGNATURE */}
        {activeTab === "signature" && (
          <div className="space-y-4 py-2">
            <Card glowColor="none" className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold font-display text-text uppercase flex items-center gap-1.5">
                  <Save size={13} className="text-secondary" /> Customer Sign-Off Signature
                </h4>
                <Button variant="ghost" size="sm" className="text-[10px] py-1 text-muted hover:text-text flex items-center gap-1" onClick={clearCanvas}>
                  <RotateCcw size={11} /> Clear
                </Button>
              </div>

              <div className="border border-border/80 rounded-xl bg-[#030712] overflow-hidden flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-36 touch-none"
                />
              </div>

              {signatureData && (
                <div className="text-[10px] text-success flex items-center gap-1">
                  <CheckCircle2 size={12} /> Digital signature captured successfully.
                </div>
              )}

              <Button variant="cyber" size="sm" className="w-full text-xs" onClick={handleSaveAssets} isLoading={loading}>
                Save Signature
              </Button>
            </Card>
          </div>
        )}

        {/* TAB 4: CHECK OUT & RESOLVE */}
        {activeTab === "checkout" && (
          <div className="space-y-4 py-2">
            <Card glowColor="none" className="p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold font-display text-text">Complete Job &amp; Check Out</h3>
                <p className="text-xs text-muted mt-0.5">
                  Record work notes, list replacement parts used, and finalize check-out coordinates.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted font-display block mb-1">Technician Remarks &amp; Diagnostics Summary</label>
                <textarea
                  rows={3}
                  placeholder="Summarize actions performed, tests run, and final system state..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#111827]/60 border border-border text-text rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <Input
                label="Parts &amp; Components Deployed"
                placeholder="e.g. Crucial 1TB SSD (1x), Cat6 Cable 5m (2x)"
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
              />

              <Button variant="primary" glow className="w-full flex items-center justify-center gap-2 mt-2" onClick={handleCheckOut} isLoading={loading}>
                <Square size={15} /> Finalize Check-Out &amp; Mark Ticket Completed
              </Button>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};
