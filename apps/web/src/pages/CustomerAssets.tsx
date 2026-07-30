import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cpu,
  Search,
  Filter,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Clock,
  Download,
  Upload,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  FileText,
  Activity,
  HardDrive,
  Printer,
  Wifi,
  Server,
} from "lucide-react";
import { Button, Card, Badge, Modal, Input, Select } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const CustomerAssets: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Request Service Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [problemDesc, setProblemDesc] = useState("");
  const [priority, setPriority] = useState("normal");
  const [serviceSuccess, setServiceSuccess] = useState("");

  // Upload Doc Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("invoice");
  const [docUrl, setDocUrl] = useState("");

  // Fetch Assets
  const { data: assetsData, isLoading } = useQuery({
    queryKey: ["customer-assets", searchTerm],
    queryFn: async () => {
      const res = await fetch(`/api/customer/assets?search=${encodeURIComponent(searchTerm)}`);
      return res.json();
    },
  });

  // Fetch Asset Details
  const { data: assetDetail } = useQuery({
    queryKey: ["customer-asset-detail", selectedAssetId],
    queryFn: async () => {
      if (!selectedAssetId) return null;
      const res = await fetch(`/api/customer/assets/${selectedAssetId}`);
      return res.json();
    },
    enabled: !!selectedAssetId,
  });

  // Service Request Mutation
  const requestServiceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customer/assets/${selectedAssetId}/service-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemDescription: problemDesc, priority }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setServiceSuccess(data.message || "Service request created!");
      setProblemDesc("");
      setTimeout(() => {
        setServiceSuccess("");
        setServiceModalOpen(false);
      }, 2000);
    },
  });

  // Upload Doc Mutation
  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customer/assets/${selectedAssetId}/upload-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docName, documentType: docType, documentUrl: docUrl || "#" }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-asset-detail", selectedAssetId] });
      setDocName("");
      setDocUrl("");
      setUploadModalOpen(false);
    },
  });

  const getAssetIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("printer")) return <Printer className="w-6 h-6 text-primary" />;
    if (lower.includes("switch") || lower.includes("router") || lower.includes("wifi")) return <Wifi className="w-6 h-6 text-primary" />;
    if (lower.includes("server") || lower.includes("nas")) return <Server className="w-6 h-6 text-primary" />;
    return <Cpu className="w-6 h-6 text-primary" />;
  };

  const assetsList = (assetsData?.assets || []).filter((a: any) => {
    if (healthFilter === "healthy") return a.currentHealth === "Healthy";
    if (healthFilter === "attention") return a.currentHealth === "Needs Attention";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body">
      <SEO
        title="My Assets & Service History | RemoteFix"
        description="View all registered IT assets, warranty status, AMC contracts, assigned technicians, and complete chronological repair history."
        canonicalUrl="https://remotefix.com/customer/assets"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-2 font-display">
            <Activity className="w-3.5 h-3.5" />
            Asset &amp; Service Portal
          </div>
          <h1 className="text-3xl font-black font-display text-text">Customer IT Assets</h1>
          <p className="text-xs text-muted mt-1">
            Real-time asset telemetry, warranty deadlines, AMC statuses, and service timelines.
          </p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-8">
        <div className="sm:col-span-8">
          <Input
            placeholder="Search by Asset Name, Serial Number, Tag, or Manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="sm:col-span-4">
          <Select
            options={[
              { label: "All Health Statuses", value: "all" },
              { label: "Healthy Only", value: "healthy" },
              { label: "Needs Attention / Critical", value: "attention" },
            ]}
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-muted">Loading customer asset inventory...</div>
      ) : assetsList.length === 0 ? (
        <Card className="text-center py-16 text-muted">No assets found matching criteria.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetsList.map((asset: any) => (
            <Card
              key={asset.id}
              glowColor="cyan"
              className="flex flex-col justify-between p-6 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedAssetId(asset.id)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                    {getAssetIcon(asset.name)}
                  </div>
                  <Badge variant={asset.currentHealth === "Healthy" ? "success" : "warning"} glow>
                    {asset.currentHealth}
                  </Badge>
                </div>

                <span className="text-[10px] text-primary font-mono uppercase font-semibold">
                  {asset.assetTag}
                </span>
                <h3 className="text-base font-bold font-display text-text mt-1">{asset.name}</h3>

                <div className="mt-4 space-y-1.5 text-xs text-muted font-body">
                  <div>Model: <span className="text-text font-semibold">{asset.model}</span></div>
                  <div>Serial: <span className="text-text font-mono">{asset.serialNumber}</span></div>
                  <div>AMC Status: <span className="text-text">{asset.amcStatus}</span></div>
                  <div>Warranty Expiry: <span className="text-text">{asset.warrantyExpiry}</span></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center text-xs">
                <span className="text-muted flex items-center gap-1">
                  <User size={12} className="text-primary" />
                  {asset.assignedTechnician?.split(" ")[0] || "Tech Assigned"}
                </span>
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  View Timeline &rarr;
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ASSET DETAIL & SERVICE TIMELINE MODAL */}
      <Modal
        isOpen={!!selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        title={assetDetail?.asset?.name || "Asset Details"}
      >
        {assetDetail && (
          <div className="flex flex-col gap-6 font-body text-xs max-h-[500px] overflow-y-auto pr-2">
            {/* Quick Spec Summary */}
            <div className="bg-[#111827]/60 border border-border p-4 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-muted block text-[10px]">Asset Tag</span>
                <span className="font-mono text-primary font-bold">{assetDetail.asset.assetTag}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Serial Number</span>
                <span className="font-mono text-text font-semibold">{assetDetail.asset.serialNumber}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Location</span>
                <span className="text-text">{assetDetail.asset.location}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Warranty Expiry</span>
                <span className="text-text font-semibold">{assetDetail.asset.warrantyExpiry}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">AMC Status</span>
                <span className="text-text font-semibold">{assetDetail.asset.amcStatus}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Assigned Tech</span>
                <span className="text-text font-semibold">{assetDetail.asset.assignedTechnician}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <Button variant="primary" size="sm" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => setServiceModalOpen(true)} glow>
                <Wrench size={14} />
                Request Support
              </Button>
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1.5" onClick={() => setUploadModalOpen(true)}>
                <Upload size={14} />
                Upload Invoice/Doc
              </Button>
            </div>

            {/* Chronological Service Timeline */}
            <div>
              <h3 className="text-sm font-bold font-display text-text border-b border-border/50 pb-2 mb-4">
                Service &amp; Repair History Timeline
              </h3>
              <div className="relative pl-6 border-l-2 border-primary/30 flex flex-col gap-6 ml-2">
                {(assetDetail.history || []).map((evt: any) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-primary bg-primary/20" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text text-xs">{evt.title}</span>
                        <span className="text-[10px] text-primary uppercase font-semibold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                          {evt.eventType}
                        </span>
                      </div>
                      <p className="text-muted mt-1 leading-relaxed">{evt.description}</p>
                      {evt.partsReplaced && (
                        <div className="mt-1 text-[11px] text-text font-mono bg-[#111827]/40 p-2 rounded border border-border/40">
                          Parts Replaced: {evt.partsReplaced}
                        </div>
                      )}
                      <span className="text-[10px] text-muted block mt-1">
                        Performed by {evt.performedBy} on {new Date(evt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloadable Documents */}
            <div>
              <h3 className="text-sm font-bold font-display text-text border-b border-border/50 pb-2 mb-3">
                Invoices, Warranties &amp; Documents
              </h3>
              <div className="flex flex-col gap-2">
                {(assetDetail.documents || []).map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center bg-[#111827]/40 p-3 rounded-lg border border-border/40">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-text font-semibold">{doc.documentName}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1">
                      <Download size={12} />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REQUEST SERVICE MODAL */}
      <Modal isOpen={serviceModalOpen} onClose={() => setServiceModalOpen(false)} title="Request Asset Support">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestServiceMutation.mutate();
          }}
          className="flex flex-col gap-4 font-body"
        >
          {serviceSuccess && (
            <div className="bg-success/15 border border-success/30 text-success text-xs rounded-lg p-3 font-body">
              {serviceSuccess}
            </div>
          )}
          <Select
            label="Service Priority"
            options={[
              { label: "Normal (Regular response)", value: "normal" },
              { label: "High (Same-day service)", value: "high" },
              { label: "Emergency SLA (15 min response)", value: "emergency" },
            ]}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted">Problem Description *</label>
            <textarea
              rows={4}
              placeholder="Describe the issue with this asset..."
              value={problemDesc}
              onChange={(e) => setProblemDesc(e.target.value)}
              className="w-full px-4 py-3 bg-[#111827]/60 border border-border focus:border-primary rounded-lg text-text text-xs outline-none"
              required
            />
          </div>
          <Button variant="primary" type="submit" isLoading={requestServiceMutation.isPending} className="w-full mt-2">
            Submit Support Request
          </Button>
        </form>
      </Modal>

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Asset Document">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadDocMutation.mutate();
          }}
          className="flex flex-col gap-4 font-body"
        >
          <Input label="Document Name *" placeholder="e.g. GST Invoice July 2026" value={docName} onChange={(e) => setDocName(e.target.value)} required />
          <Select
            label="Document Type"
            options={[
              { label: "Invoice / Bill", value: "invoice" },
              { label: "Warranty Certificate", value: "warranty" },
              { label: "AMC Contract", value: "amc_contract" },
              { label: "Service Report", value: "report" },
            ]}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          />
          <Input label="Document URL / Storage Path *" placeholder="https://storage.remotefix.com/docs/..." value={docUrl} onChange={(e) => setDocUrl(e.target.value)} required />
          <Button variant="primary" type="submit" isLoading={uploadDocMutation.isPending} className="w-full mt-2">
            Upload Document
          </Button>
        </form>
      </Modal>
    </div>
  );
};
