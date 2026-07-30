/**
 * Mobile Technician API Client
 * Bridge between React Native Mobile App & RemoteFix Hono API Gateway
 */
export class MobileApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "http://localhost:8787") {
    this.baseUrl = baseUrl;
  }

  public setAuthToken(token: string) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    return headers;
  }

  /** Biometric Login */
  public async biometricLogin(engineerEmail: string, biometricToken?: string) {
    const res = await fetch(`${this.baseUrl}/api/mobile/auth/biometric-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engineerEmail, biometricToken }),
    });
    const data = await res.json();
    if (data.token) this.token = data.token;
    return data;
  }

  /** Fetch Today's Assigned Jobs */
  public async getAssignedJobs() {
    const res = await fetch(`${this.baseUrl}/api/mobile/jobs`, { headers: this.getHeaders() });
    return res.json();
  }

  /** Execute Job Action State Machine */
  public async executeJobAction(jobId: string, action: string, gpsLocation?: { lat: number; lng: number }) {
    const res = await fetch(`${this.baseUrl}/api/mobile/jobs/${jobId}/action`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ action, gpsLocation }),
    });
    return res.json();
  }

  /** Capture Digital Signature */
  public async submitSignature(jobId: string, signatureBase64: string, customerName?: string) {
    const res = await fetch(`${this.baseUrl}/api/mobile/jobs/${jobId}/signature`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ signatureBase64, customerName }),
    });
    return res.json();
  }

  /** Scan QR Code or Barcode */
  public async scanQrCode(qrPayload: string) {
    const res = await fetch(`${this.baseUrl}/api/mobile/qr-scan`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ qrPayload }),
    });
    return res.json();
  }
}
