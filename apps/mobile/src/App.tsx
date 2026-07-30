import React, { useState } from "react";
import { MobileApiClient } from "./services/mobileApi.js";
import { MobileOfflineSyncManager } from "./services/offlineSync.js";

const api = new MobileApiClient();
const syncManager = new MobileOfflineSyncManager();

export const MobileTechnicianApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"login" | "dashboard" | "job_detail" | "qr_scanner" | "signature">("login");
  const [email, setEmail] = useState("field.technician@remotefix.com");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  const handleBiometricLogin = async () => {
    try {
      const res = await api.biometricLogin(email);
      if (res.success && res.token) {
        setAuthToken(res.token);
        const jobRes = await api.getAssignedJobs();
        setJobs(jobRes.jobs || []);
        setCurrentScreen("dashboard");
      }
    } catch (err) {
      console.error("Biometric login failed", err);
    }
  };

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      const res = await api.executeJobAction(jobId, action, { lat: 28.4595, lng: 77.0266 });
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: res.newStatus } : j))
        );
      }
    } catch (err) {
      // Enqueue offline action if network error
      syncManager.enqueue("status_update", { jobId, action });
      setSyncStatus("Action queued offline. Will sync automatically when connection returns.");
    }
  };

  const handleScanQr = async (code: string) => {
    const res = await api.scanQrCode(code);
    if (res.success) {
      setScanResult(res.asset);
    }
  };

  const handleCaptureSignature = async () => {
    if (!selectedJob) return;
    const res = await api.submitSignature(selectedJob.id, "DATA_URL_BASE64_SIG");
    if (res.success) {
      setSignatureCaptured(true);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "0 auto", padding: "16px", backgroundColor: "#030712", color: "#F9FAFB", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1F2937", paddingBottom: "12px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", margin: 0, color: "#00E5FF" }}>RemoteFix Mobile Technician</h2>
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Material Design 3 • Android / iOS Ready</span>
      </div>

      {/* LOGIN SCREEN */}
      {currentScreen === "login" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px 0" }}>
          <h3>Biometric Technician Authentication</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #374151", backgroundColor: "#111827", color: "#FFF" }}
          />
          <button
            onClick={handleBiometricLogin}
            style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#00E5FF", color: "#030712", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            Authenticate via Fingerprint / Face ID
          </button>
        </div>
      )}

      {/* DASHBOARD SCREEN */}
      {currentScreen === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Today's Assigned Field Jobs ({jobs.length})</h4>
            <button onClick={() => setCurrentScreen("qr_scanner")} style={{ padding: "6px 12px", backgroundColor: "#1F2937", border: "1px solid #374151", color: "#00E5FF", borderRadius: "6px", cursor: "pointer" }}>
              Scan QR / Barcode
            </button>
          </div>

          {syncStatus && <div style={{ padding: "8px", backgroundColor: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: "6px", fontSize: "12px", color: "#00E5FF" }}>{syncStatus}</div>}

          {jobs.map((job) => (
            <div key={job.id} style={{ border: "1px solid #374151", borderRadius: "12px", padding: "16px", backgroundColor: "#111827" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#00E5FF" }}>{job.ticketNumber}</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", backgroundColor: job.priority === "emergency" ? "#EF4444" : "#F59E0B", color: "#FFF" }}>
                  SLA: {job.slaRemainingMin}m
                </span>
              </div>
              <h5 style={{ margin: "4px 0", fontSize: "14px" }}>{job.customerName}</h5>
              <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "4px 0" }}>{job.address}</p>
              <p style={{ fontSize: "12px", color: "#D1D5DB", margin: "8px 0" }}>{job.problemDescription}</p>

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => handleJobAction(job.id, "start_travel")} style={{ flex: 1, padding: "8px", backgroundColor: "#3B82F6", color: "#FFF", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                  Start Travel
                </button>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setCurrentScreen("job_detail");
                  }}
                  style={{ flex: 1, padding: "8px", backgroundColor: "#1F2937", color: "#FFF", border: "1px solid #374151", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOB DETAIL SCREEN */}
      {currentScreen === "job_detail" && selectedJob && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => setCurrentScreen("dashboard")} style={{ alignSelf: "flex-start", padding: "4px 8px", backgroundColor: "transparent", color: "#00E5FF", border: "none", cursor: "pointer" }}>
            &larr; Back to Jobs
          </button>

          <h3 style={{ margin: 0 }}>{selectedJob.ticketNumber} - {selectedJob.customerName}</h3>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Contact: {selectedJob.contactNumber}</p>
          <p style={{ fontSize: "12px", color: "#D1D5DB" }}>Assigned Assets: {selectedJob.assignedAssets}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <button onClick={() => handleJobAction(selectedJob.id, "start_work")} style={{ padding: "10px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
              Start On-Site Work
            </button>
            <button onClick={() => setCurrentScreen("signature")} style={{ padding: "10px", backgroundColor: "#8B5CF6", color: "#FFF", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
              Collect Customer Signature
            </button>
            <button onClick={() => handleJobAction(selectedJob.id, "complete")} style={{ padding: "10px", backgroundColor: "#00E5FF", color: "#030712", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
              Complete Work Order
            </button>
          </div>
        </div>
      )}

      {/* QR SCANNER SCREEN */}
      {currentScreen === "qr_scanner" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => setCurrentScreen("dashboard")} style={{ alignSelf: "flex-start", padding: "4px 8px", backgroundColor: "transparent", color: "#00E5FF", border: "none", cursor: "pointer" }}>
            &larr; Back
          </button>
          <h3>QR Code / Barcode Scanner</h3>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Camera scanning mode active. Point camera at asset QR code.</p>

          <button onClick={() => handleScanQr("RF-AST-00101")} style={{ padding: "12px", backgroundColor: "#00E5FF", color: "#030712", fontWeight: "bold", border: "none", borderRadius: "8px" }}>
            Simulate Instant QR Scan (RF-AST-00101)
          </button>

          {scanResult && (
            <div style={{ border: "1px solid #10B981", borderRadius: "8px", padding: "12px", backgroundColor: "rgba(16,185,129,0.1)", fontSize: "12px" }}>
              <h4 style={{ margin: "0 0 4px 0", color: "#10B981" }}>Asset Identified: {scanResult.name}</h4>
              <p style={{ margin: "2px 0" }}>Serial: {scanResult.serialNumber}</p>
              <p style={{ margin: "2px 0" }}>Warranty: {scanResult.warrantyStatus}</p>
              <p style={{ margin: "2px 0" }}>AMC: {scanResult.amcStatus}</p>
            </div>
          )}
        </div>
      )}

      {/* DIGITAL SIGNATURE SCREEN */}
      {currentScreen === "signature" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => setCurrentScreen("job_detail")} style={{ alignSelf: "flex-start", padding: "4px 8px", backgroundColor: "transparent", color: "#00E5FF", border: "none", cursor: "pointer" }}>
            &larr; Back
          </button>
          <h3>Customer Digital Signature Pad</h3>
          <div style={{ height: "180px", border: "2px dashed #374151", borderRadius: "12px", backgroundColor: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
            [Customer Signature Touch Pad Canvas]
          </div>

          <button onClick={handleCaptureSignature} style={{ padding: "12px", backgroundColor: "#10B981", color: "#FFF", fontWeight: "bold", border: "none", borderRadius: "8px" }}>
            Sign &amp; Generate Work Certificate
          </button>

          {signatureCaptured && (
            <div style={{ padding: "12px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid #10B981", borderRadius: "8px", fontSize: "12px", color: "#10B981" }}>
              ✓ Signature timestamped with GPS coordinates and attached to Work Order.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
