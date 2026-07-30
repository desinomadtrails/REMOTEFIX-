import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, Plus, QrCode, Search, Wrench, AlertTriangle, ShieldCheck, CheckCircle2, Sparkles, Activity, AlertCircle } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newAssetModalOpen, setNewAssetModalOpen] = useState(false);
  const [qrModalAsset, setQrModalAsset] = useState<any>(null);

  // Predictive Scan Modal State
  const [predictiveAsset, setPredictiveAsset] = useState<any>(null);
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [predictiveLoading, setPredictiveLoading] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("Laptop");
  const [assetBrand, setAssetBrand] = useState("");
  const [assetModel, setAssetModel] = useState("");
  const [assetSerial, setAssetSerial] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");

  const { data: assetsData = [], isLoading } = useQuery({
    queryKey: ["admin-assets"],
    queryFn: async () => {
      const res = await api.getAssets();
      return res.assets || [];
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: (data: any) => api.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      setNewAssetModalOpen(false);
      setAssetName("");
      setAssetBrand("");
      setAssetModel("");
      setAssetSerial("");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateAssetStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
    },
  });

  const handlePredictiveScan = async (asset: any) => {
    setPredictiveAsset(asset);
    setPredictiveLoading(true);
    setPredictiveData(null);
    try {
      const res = await api.aiPredictMaintenance(asset);
      setPredictiveData(res.prediction);
    } catch (err: any) {
      alert("Predictive scan failed: " + err.message);
    } finally {
      setPredictiveLoading(false);
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetBrand || !assetModel) return;
    createAssetMutation.mutate({
      name: assetName,
      type: assetType,
      brand: assetBrand,
      model: assetModel,
      serialNumber: assetSerial || undefined,
      purchaseDate: purchaseDate || undefined,
      warrantyExpiryDate: warrantyExpiry || undefined,
    });
  };

  const filteredAssets = assetsData.filter((a: any) => {
    const sl = search.toLowerCase();
    const matchSearch = !sl || a.name.toLowerCase().includes(sl) || a.assetTag.toLowerCase().includes(sl) || a.brand.toLowerCase().includes(sl) || a.model.toLowerCase().includes(sl);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black font-display text-text">Enterprise Asset Management &amp; Predictive Maintenance</h1>
          <p className="text-xs text-muted font-body mt-0.5">
            ITAM inventory tracking, QR code physical tags, and AI predictive hardware failure risk alerts.
          </p>
        </div>

        <Button variant="primary" glow className="flex items-center gap-2 text-xs" onClick={() => setNewAssetModalOpen(true)}>
          <Plus size={15} /> Add Hardware Asset
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-card/40 p-4 rounded-xl border border-border/40">
        <div className="relative w-full md:w-72">
          <Input placeholder="Search asset tag, name, model..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-xs" />
          <Search className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "maintenance", label: "Maintenance" },
              { value: "retired", label: "Retired" },
            ]}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="text-xs"
          />

          <Select
            options={[
              { value: "all", label: "All Types" },
              { value: "Laptop", label: "Laptops" },
              { value: "Desktop", label: "Desktops" },
              { value: "Server", label: "Servers" },
              { value: "Router", label: "Routers" },
            ]}
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="text-center py-16 text-muted">
          <Cpu size={40} className="mx-auto mb-3 text-muted/30" />
          <h3 className="text-base font-bold font-display text-text">No IT Hardware Assets Found</h3>
          <p className="text-xs max-w-sm mx-auto mt-1">Onboard corporate laptops, servers, and routers to track lifetime warranties and printable QR tags.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setNewAssetModalOpen(true)}>
            Onboard First Hardware Asset
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset: any) => (
            <Card key={asset.id} glowColor="purple" className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-secondary/15 border border-secondary/20 rounded-lg text-secondary">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-display text-text">{asset.name}</h3>
                      <span className="text-[10px] text-muted font-mono">{asset.brand} {asset.model}</span>
                    </div>
                  </div>
                  <Badge variant={asset.status === "active" ? "success" : asset.status === "maintenance" ? "warning" : "danger"} className="text-[9px] uppercase">
                    {asset.status}
                  </Badge>
                </div>

                <div className="mt-3 p-2.5 bg-black/20 border border-border/40 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted">TAG:</span>
                    <span className="text-secondary font-bold select-all">{asset.assetTag}</span>
                  </div>
                  {asset.serialNumber && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted">SERIAL:</span>
                      <span className="text-text font-semibold">{asset.serialNumber}</span>
                    </div>
                  )}
                  {asset.warrantyExpiryDate && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted">WARRANTY:</span>
                      <span className="text-success font-semibold">{asset.warrantyExpiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 text-secondary" onClick={() => setQrModalAsset(asset)}>
                  <QrCode size={14} /> Printable QR
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="text-[10px] py-1 text-primary border-primary/30 flex items-center gap-1" onClick={() => handlePredictiveScan(asset)}>
                    <Activity size={11} /> AI Risk Scan
                  </Button>
                  {asset.status !== "active" && (
                    <Button variant="outline" size="sm" className="text-[10px] py-1" onClick={() => updateStatusMutation.mutate({ id: asset.id, status: "active" })}>
                      Active
                    </Button>
                  )}
                  {asset.status !== "maintenance" && (
                    <Button variant="ghost" size="sm" className="text-[10px] py-1 text-warning hover:bg-warning/10" onClick={() => updateStatusMutation.mutate({ id: asset.id, status: "maintenance" })}>
                      Maintenance
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PREDICTIVE RISK SCAN MODAL */}
      {predictiveAsset && (
        <Modal isOpen={!!predictiveAsset} onClose={() => setPredictiveAsset(null)} title={`AI Predictive Health Scan — ${predictiveAsset.name}`}>
          <div className="space-y-4 font-body py-1 text-xs">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block font-display flex items-center gap-1">
                <Sparkles size={13} /> Asset Telemetry Profile
              </span>
              <p className="text-text font-semibold">{predictiveAsset.brand} {predictiveAsset.model} ({predictiveAsset.assetTag})</p>
            </div>

            {predictiveLoading ? (
              <div className="py-8 text-center space-y-2">
                <Activity size={28} className="mx-auto text-primary animate-pulse" />
                <p className="text-xs text-muted font-display">Evaluating SMART disk controllers &amp; thermal risk metrics...</p>
              </div>
            ) : predictiveData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card/60 border border-border/40 rounded-xl">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Predictive Risk Score</span>
                    <span className={`text-2xl font-black font-display ${predictiveData.riskScore > 70 ? "text-danger" : predictiveData.riskScore > 40 ? "text-warning" : "text-success"}`}>
                      {predictiveData.riskScore}%
                    </span>
                  </div>
                  <Badge variant={predictiveData.riskLevel === "critical" ? "danger" : predictiveData.riskLevel === "moderate" ? "warning" : "success"} className="text-[10px] uppercase">
                    {predictiveData.riskLevel} Risk
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-bold block">Predicted Failure Window</span>
                  <span className="text-sm font-bold text-text font-display">{predictiveData.predictedFailureWindow}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted uppercase font-bold block">Risk Factors Analyzed</span>
                  <div className="p-3 bg-black/40 border border-border/40 rounded-xl space-y-1.5 font-mono text-[11px]">
                    {predictiveData.riskFactors.map((rf: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-muted">
                        <AlertCircle size={13} className="text-warning shrink-0" />
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-success/10 border border-success/30 rounded-xl space-y-1">
                  <span className="text-[10px] text-success font-bold block uppercase">Recommended Preventive Action</span>
                  <p className="text-text font-semibold">{predictiveData.preventiveRecommendation}</p>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}

      {/* CREATE ASSET MODAL */}
      <Modal isOpen={newAssetModalOpen} onClose={() => setNewAssetModalOpen(false)} title="Add IT Hardware Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4 font-body">
          <Input label="Asset Name *" placeholder="Executive Laptop #14" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />

          <Select
            label="Asset Category"
            options={[
              { value: "Laptop", label: "Laptop Computer" },
              { value: "Desktop", label: "Desktop Workstation" },
              { value: "Server", label: "Rack Server / NAS" },
              { value: "Router", label: "Network Router / Firewall" },
            ]}
            value={assetType}
            onChange={(e: any) => setAssetType(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand / Manufacturer *" placeholder="Dell / Lenovo" value={assetBrand} onChange={(e) => setAssetBrand(e.target.value)} required />
            <Input label="Model *" placeholder="Latitude 5430" value={assetModel} onChange={(e) => setAssetModel(e.target.value)} required />
          </div>

          <Input label="Serial Number" placeholder="SN-88492042" value={assetSerial} onChange={(e) => setAssetSerial(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            <Input label="Warranty Expiry Date" type="date" value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} />
          </div>

          <Button variant="primary" type="submit" glow className="w-full mt-2" isLoading={createAssetMutation.isPending}>
            Onboard Hardware Asset
          </Button>
        </form>
      </Modal>

      {/* PRINTABLE QR TAG MODAL */}
      {qrModalAsset && (
        <Modal isOpen={!!qrModalAsset} onClose={() => setQrModalAsset(null)} title={`Asset QR Tag — ${qrModalAsset.assetTag}`}>
          <div className="space-y-4 font-body text-center py-2">
            <div className="p-6 bg-white rounded-xl inline-block border-4 border-primary">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://remotefix.com/scan/${qrModalAsset.assetTag}`)}`}
                alt={qrModalAsset.assetTag}
                className="w-44 h-44 mx-auto"
              />
              <span className="text-black font-mono font-bold text-sm block mt-2 tracking-widest">{qrModalAsset.assetTag}</span>
              <span className="text-gray-600 text-[10px] block">{qrModalAsset.name}</span>
            </div>

            <Button variant="primary" size="sm" className="w-full mt-3 flex items-center justify-center gap-2" onClick={() => window.print()}>
              Print Physical QR Tag Sticker
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
