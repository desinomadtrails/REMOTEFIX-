import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Laptop, QrCode, Plus, Search, Filter, ShieldCheck, AlertTriangle, Download, Server, HardDrive, Cpu, ExternalLink } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalAsset, setQrModalAsset] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"Laptop" | "Desktop" | "Server" | "Router" | "CCTV" | "Printer" | "Other">("Laptop");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: assetsList = [], isLoading } = useQuery({
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
      setCreateModalOpen(false);
      setName("");
      setBrand("");
      setModel("");
      setSerialNumber("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to register asset.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => api.updateAssetStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
    },
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !model) return;
    createAssetMutation.mutate({
      name,
      type,
      brand,
      model,
      serialNumber: serialNumber || undefined,
      purchaseDate: purchaseDate || undefined,
      warrantyExpiryDate: warrantyExpiryDate || undefined,
      notes: notes || undefined,
    });
  };

  const filteredAssets = assetsList.filter((asset: any) => {
    const matchesQuery =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || asset.type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/15 rounded-full border border-secondary/20 text-xs font-semibold uppercase tracking-wider text-secondary mb-2 font-display">
            <Laptop className="w-3.5 h-3.5" /> Enterprise ITAM &amp; QR Tracking
          </div>
          <h1 className="text-2xl font-black font-display text-text">IT Hardware Assets &amp; Printable QR Tags</h1>
          <p className="text-xs text-muted font-body mt-0.5">
            Register hardware inventory, track warranties, and generate printable QR code tags for instant repair scanning.
          </p>
        </div>

        <Button variant="primary" glow className="flex items-center gap-2 text-xs" style={{ backgroundColor: "#8B5CF6", color: "white" }} onClick={() => setCreateModalOpen(true)}>
          <Plus size={15} /> Register New Asset
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/40 p-4 rounded-xl border border-border/40">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search by name, tag, brand, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={14} className="text-muted" />
          <Select
            options={[
              { value: "all", label: "All Asset Types" },
              { value: "Laptop", label: "Laptops" },
              { value: "Desktop", label: "Desktops" },
              { value: "Server", label: "Servers" },
              { value: "Router", label: "Routers / Networking" },
              { value: "CCTV", label: "CCTV Systems" },
              { value: "Printer", label: "Printers / Scanners" },
              { value: "Other", label: "Other Hardware" },
            ]}
            value={selectedType}
            onChange={(e: any) => setSelectedType(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="text-center py-16 text-muted">
          <HardDrive size={40} className="mx-auto mb-3 text-muted/30" />
          <h3 className="text-base font-bold font-display text-text">No Assets Found</h3>
          <p className="text-xs max-w-sm mx-auto mt-1">Register hardware inventory to track warranties and generate printable QR code tags.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
            Register First Hardware Asset
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
                  {asset.status !== "active" && (
                    <Button variant="outline" size="sm" className="text-[10px] py-1" onClick={() => updateStatusMutation.mutate({ id: asset.id, status: "active" })}>
                      Active
                    </Button>
                  )}
                  {asset.status !== "maintenance" && (
                    <Button variant="outline" size="sm" className="text-[10px] py-1 text-warning" onClick={() => updateStatusMutation.mutate({ id: asset.id, status: "maintenance" })}>
                      Service
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTER ASSET MODAL */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register IT Hardware Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4 font-body">
          {errorMsg && <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg">{errorMsg}</div>}

          <Input label="Asset Name *" placeholder="Dell Latitude 5420 Workstation" value={name} onChange={(e) => setName(e.target.value)} required />

          <Select
            label="Hardware Type *"
            options={[
              { value: "Laptop", label: "Laptop Workstation" },
              { value: "Desktop", label: "Desktop PC" },
              { value: "Server", label: "Rack Server / Appliance" },
              { value: "Router", label: "Router / Switch / Firewall" },
              { value: "CCTV", label: "CCTV Surveillance System" },
              { value: "Printer", label: "Printer / Scanner" },
              { value: "Other", label: "Other IT Equipment" },
            ]}
            value={type}
            onChange={(e: any) => setType(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand *" placeholder="Dell / Apple / Cisco" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            <Input label="Model *" placeholder="Latitude 5420" value={model} onChange={(e) => setModel(e.target.value)} required />
          </div>

          <Input label="Serial Number" placeholder="SN-99401284" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Purchase Date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            <Input label="Warranty Expiry Date" type="date" value={warrantyExpiryDate} onChange={(e) => setWarrantyExpiryDate(e.target.value)} />
          </div>

          <Button variant="primary" type="submit" glow className="w-full mt-2" style={{ backgroundColor: "#8B5CF6", color: "white" }} isLoading={createAssetMutation.isPending}>
            Generate QR Tag &amp; Save Asset
          </Button>
        </form>
      </Modal>

      {/* PRINTABLE QR CODE MODAL */}
      {qrModalAsset && (
        <Modal isOpen={!!qrModalAsset} onClose={() => setQrModalAsset(null)} title="Printable Hardware QR Tag">
          <div className="text-center space-y-4 font-body py-2">
            <div className="p-4 bg-white rounded-xl inline-block shadow-lg border border-border">
              <img src={qrModalAsset.qrCodeUrl} alt={qrModalAsset.assetTag} className="w-48 h-48 mx-auto" />
              <span className="block text-black font-mono font-bold text-xs mt-2">{qrModalAsset.assetTag}</span>
            </div>

            <div>
              <h4 className="text-sm font-bold font-display text-text">{qrModalAsset.name}</h4>
              <p className="text-xs text-muted mt-0.5">{qrModalAsset.brand} {qrModalAsset.model}</p>
              <p className="text-[10px] text-secondary font-mono mt-1">Scan QR code with smartphone to trigger instant repair ticket</p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={() => window.print()}>
                <Download size={14} /> Print Tag Label
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
