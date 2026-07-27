import React, { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Package, DollarSign, ShoppingCart } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { formatCurrency } from "@remotefix/utils";

const DEFAULT_PRODUCTS = [
  { sku: "SSD-1TB", name: "Crucial 1TB NVMe SSD", category: "Storage", stock: 4, threshold: 5, unitCost: 85.00 },
  { sku: "CAT6-100", name: "Cat6 Ethernet Cable 100m", category: "Networking", stock: 12, threshold: 5, unitCost: 45.00 },
  { sku: "SW-8P", name: "Netgear 8-Port Gigabit Switch", category: "Networking", stock: 2, threshold: 3, unitCost: 35.00 },
  { sku: "RJ45-100", name: "RJ45 Connectors (Pack/100)", category: "Accessories", stock: 25, threshold: 10, unitCost: 15.00 },
];
const DEFAULT_SUPPLIERS = [
  { id: "sup-1", name: "StarTech Distribution", contact: "sales@startech.com", phone: "800-265-1844" },
  { id: "sup-2", name: "Cisco Systems Direct", contact: "orders@cisco.com", phone: "800-553-6387" },
];
const DEFAULT_POS = [
  { id: "PO-20260727-001", sku: "SSD-1TB", qty: 10, supplier: "StarTech Distribution", status: "ordered", createdAt: "2026-07-27" },
];
const DEFAULT_ISSUES = [
  { id: "ISS-001", ticketId: "RF-100247", sku: "CAT6-100", qty: 1, createdAt: "2026-07-27" },
];

function load<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
}
function save<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }

type SubTab = "products" | "suppliers" | "pos" | "issues";

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>(() => load("rf_inv_products", DEFAULT_PRODUCTS));
  const [suppliers, setSuppliers] = useState<any[]>(() => load("rf_inv_suppliers", DEFAULT_SUPPLIERS));
  const [purchaseOrders, setPOs] = useState<any[]>(() => load("rf_inv_pos", DEFAULT_POS));
  const [issues, setIssues] = useState<any[]>(() => load("rf_inv_issues", DEFAULT_ISSUES));

  useEffect(() => { save("rf_inv_products", products); }, [products]);
  useEffect(() => { save("rf_inv_suppliers", suppliers); }, [suppliers]);
  useEffect(() => { save("rf_inv_pos", purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { save("rf_inv_issues", issues); }, [issues]);

  const [subTab, setSubTab] = useState<SubTab>("products");
  const [invSearch, setInvSearch] = useState("");
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [newPoOpen, setNewPoOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [pf, setPf] = useState({ sku: "", name: "", category: "Storage", stock: "", threshold: "5", unitCost: "" });
  const [sf, setSf] = useState({ name: "", contact: "", phone: "" });
  const [pof, setPof] = useState({ sku: products[0]?.sku || "", qty: "", supplier: suppliers[0]?.name || "" });
  const [isf, setIsf] = useState({ ticketId: "", sku: products[0]?.sku || "", qty: "" });

  const lowStock = products.filter(p => p.stock <= p.threshold);
  const totalValue = products.reduce((s, p) => s + p.stock * p.unitCost, 0);
  const filteredProducts = products.filter(p => !invSearch || p.sku.toLowerCase().includes(invSearch.toLowerCase()) || p.name.toLowerCase().includes(invSearch.toLowerCase()));

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (products.some(p => p.sku === pf.sku.toUpperCase())) { alert("SKU already exists"); return; }
    setProducts([...products, { sku: pf.sku.toUpperCase(), name: pf.name, category: pf.category, stock: parseInt(pf.stock), threshold: parseInt(pf.threshold), unitCost: parseFloat(pf.unitCost) }]);
    setNewProductOpen(false); setPf({ sku: "", name: "", category: "Storage", stock: "", threshold: "5", unitCost: "" });
  };

  const addSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    setSuppliers([...suppliers, { id: `sup-${Date.now().toString().slice(-4)}`, ...sf }]);
    setNewSupplierOpen(false); setSf({ name: "", contact: "", phone: "" });
  };

  const addPO = (e: React.FormEvent) => {
    e.preventDefault();
    setPOs([{ id: `PO-${new Date().toISOString().split("T")[0].replace(/-/g,"")}-${Math.floor(100+Math.random()*900)}`, sku: pof.sku, qty: parseInt(pof.qty), supplier: pof.supplier, status: "ordered", createdAt: new Date().toISOString().split("T")[0] }, ...purchaseOrders]);
    setNewPoOpen(false); setPof(p => ({ ...p, qty: "" }));
  };

  const receiveGoods = (id: string) => {
    const po = purchaseOrders.find(o => o.id === id);
    if (!po || po.status === "received") return;
    setPOs(purchaseOrders.map(o => o.id === id ? { ...o, status: "received" } : o));
    setProducts(products.map(p => p.sku === po.sku ? { ...p, stock: p.stock + po.qty } : p));
  };

  const addIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(isf.qty);
    const prod = products.find(p => p.sku === isf.sku);
    if (!prod || prod.stock < qty) { alert("Insufficient stock!"); return; }
    setProducts(products.map(p => p.sku === isf.sku ? { ...p, stock: p.stock - qty } : p));
    setIssues([{ id: `ISS-${Date.now().toString().slice(-6)}`, ticketId: isf.ticketId, sku: isf.sku, qty, createdAt: new Date().toISOString().split("T")[0] }, ...issues]);
    setNewIssueOpen(false); setIsf(i => ({ ...i, ticketId: "", qty: "" }));
  };

  const SUB_TABS: [SubTab, string][] = [["products","Stock Sheets"],["suppliers","Suppliers"],["pos","Purchase Orders"],["issues","Material Issues"]];

  return (
    <div className="space-y-5 font-body">
      {lowStock.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 flex gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div><strong className="text-sm block">Low Stock Alert!</strong>
            <span className="text-xs">{lowStock.map(p => `${p.sku} (${p.stock} left)`).join(", ")}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Asset Value", value: formatCurrency(totalValue), icon: <DollarSign size={20} className="text-secondary" /> },
          { label: "Low Stock Items", value: `${lowStock.length} SKUs`, icon: <AlertTriangle size={20} className="text-danger" /> },
          { label: "Total Products", value: `${products.length} Items`, icon: <Package size={20} className="text-secondary" /> },
        ].map((m, i) => (
          <Card key={i} glowColor="purple" className="p-5 flex items-center justify-between">
            <div><span className="text-[10px] text-muted uppercase font-semibold block">{m.label}</span><span className="text-xl font-black font-display text-text mt-1 block">{m.value}</span></div>
            {m.icon}
          </Card>
        ))}
      </div>

      <div className="flex gap-3 border-b border-border/25 pb-0">
        {SUB_TABS.map(([k, l]) => (
          <button key={k} onClick={() => setSubTab(k)} className={`text-xs font-bold font-display px-3 py-2.5 border-b-2 cursor-pointer transition-all whitespace-nowrap ${subTab === k ? "border-secondary text-secondary bg-secondary/5 rounded-t-lg" : "border-transparent text-muted hover:text-text"}`}>{l}</button>
        ))}
      </div>

      {subTab === "products" && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-grow max-w-sm">
              <Input placeholder="Search SKU or name..." value={invSearch} onChange={e => setInvSearch(e.target.value)} className="pl-9 text-xs" />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
            </div>
            <Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setNewProductOpen(true)}><Plus size={13} /> Add SKU</Button>
          </div>
          <Card glowColor="none" className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-left text-muted border-collapse">
              <thead><tr className="border-b border-border/50 text-text font-bold uppercase font-display text-[10px]">
                {["SKU","Product","Category","Stock","Limit","Cost","Value",""].map(h => <th key={h} className="pb-2.5 pr-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.sku} className="border-b border-border/20 hover:bg-white/3">
                    <td className="py-2.5 pr-4 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="py-2.5 pr-4 text-text font-semibold">{p.name}</td>
                    <td className="py-2.5 pr-4">{p.category}</td>
                    <td className={`py-2.5 pr-4 font-bold ${p.stock <= p.threshold ? "text-danger" : "text-text"}`}>{p.stock}</td>
                    <td className="py-2.5 pr-4 font-mono">{p.threshold}</td>
                    <td className="py-2.5 pr-4">{formatCurrency(p.unitCost)}</td>
                    <td className="py-2.5 pr-4 font-bold text-text">{formatCurrency(p.stock * p.unitCost)}</td>
                    <td className="py-2.5"><Button variant="ghost" size="sm" className="text-[10px] text-danger hover:bg-danger/10 py-0.5" onClick={() => { if(window.confirm(`Delete ${p.sku}?`)) setProducts(products.filter(x => x.sku !== p.sku)); }}>Del</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {subTab === "suppliers" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setNewSupplierOpen(true)}><Plus size={13} /> Add Supplier</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map(s => <Card key={s.id} className="p-4 text-xs"><h4 className="font-bold text-text text-sm mb-2">{s.name}</h4><div className="text-muted space-y-0.5"><div>Email: <span className="text-text">{s.contact}</span></div><div>Phone: <span className="text-text">{s.phone}</span></div></div></Card>)}
          </div>
        </div>
      )}

      {subTab === "pos" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setNewPoOpen(true)}><Plus size={13} /> New PO</Button></div>
          <Card glowColor="none" className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-left text-muted border-collapse">
              <thead><tr className="border-b border-border/50 text-text font-bold uppercase font-display text-[10px]">
                {["PO Code","SKU","Qty","Supplier","Date","Status",""].map(h => <th key={h} className="pb-2.5 pr-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="border-b border-border/20 hover:bg-white/3">
                    <td className="py-2.5 pr-4 font-mono font-bold text-primary text-[10px]">{po.id}</td>
                    <td className="py-2.5 pr-4 text-text font-semibold">{po.sku}</td>
                    <td className="py-2.5 pr-4 font-bold text-text">{po.qty}</td>
                    <td className="py-2.5 pr-4">{po.supplier}</td>
                    <td className="py-2.5 pr-4 font-mono">{po.createdAt}</td>
                    <td className="py-2.5 pr-4"><Badge variant={po.status === "received" ? "success" : "warning"} className="text-[9px]">{po.status}</Badge></td>
                    <td className="py-2.5">{po.status === "ordered" && <Button variant="ghost" size="sm" className="text-[10px] text-success hover:bg-success/10 py-0.5" onClick={() => receiveGoods(po.id)}>Receive</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {subTab === "issues" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button variant="cyber" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => setNewIssueOpen(true)}><Plus size={13} /> Issue Parts</Button></div>
          <Card glowColor="none" className="p-4 overflow-x-auto">
            <table className="w-full text-xs text-left text-muted border-collapse">
              <thead><tr className="border-b border-border/50 text-text font-bold uppercase font-display text-[10px]">
                {["Issue ID","Ticket","SKU","Qty","Date"].map(h => <th key={h} className="pb-2.5 pr-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {issues.map(iss => (
                  <tr key={iss.id} className="border-b border-border/20 hover:bg-white/3">
                    <td className="py-2.5 pr-4 font-mono font-bold text-primary text-[10px]">{iss.id}</td>
                    <td className="py-2.5 pr-4 font-mono text-text">{iss.ticketId}</td>
                    <td className="py-2.5 pr-4 text-text font-semibold">{iss.sku}</td>
                    <td className="py-2.5 pr-4 font-bold text-text">{iss.qty}</td>
                    <td className="py-2.5 pr-4 font-mono">{iss.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={newProductOpen} onClose={() => setNewProductOpen(false)} title="Add Product SKU">
        <form onSubmit={addProduct} className="flex flex-col gap-3 font-body">
          {[["SKU Code *","sku","CAT6-50"],["Product Name *","name","Cat6 Cable 50m"],["Stock *","stock","10"],["Safety Limit","threshold","5"],["Unit Cost ($) *","unitCost","45.00"]].map(([l,f,ph]) => (
            <Input key={f as string} label={l as string} placeholder={ph as string} value={(pf as any)[f as string]} onChange={e => setPf(p => ({...p,[f as string]:e.target.value}))} required={(l as string).endsWith("*")} />
          ))}
          <Select label="Category" options={["Storage","Networking","Accessories","Tools"].map(v=>({label:v,value:v}))} value={pf.category} onChange={(e:any)=>setPf(p=>({...p,category:e.target.value}))} />
          <Button variant="primary" type="submit" className="w-full mt-2" style={{backgroundColor:"#8B5CF6",color:"white"}}>Add Product</Button>
        </form>
      </Modal>
      <Modal isOpen={newSupplierOpen} onClose={() => setNewSupplierOpen(false)} title="Add Supplier">
        <form onSubmit={addSupplier} className="flex flex-col gap-3 font-body">
          {[["Name *","name","Cisco Systems"],["Email *","contact","orders@cisco.com"],["Phone","phone","800-553-6387"]].map(([l,f,ph]) => (
            <Input key={f as string} label={l as string} placeholder={ph as string} value={(sf as any)[f as string]} onChange={e=>setSf(s=>({...s,[f as string]:e.target.value}))} required={(l as string).endsWith("*")} />
          ))}
          <Button variant="primary" type="submit" className="w-full mt-2" style={{backgroundColor:"#8B5CF6",color:"white"}}>Add Supplier</Button>
        </form>
      </Modal>
      <Modal isOpen={newPoOpen} onClose={() => setNewPoOpen(false)} title="Compile Purchase Order">
        <form onSubmit={addPO} className="flex flex-col gap-3 font-body">
          <Select label="Product SKU" options={products.map(p=>({label:`${p.sku} — ${p.name}`,value:p.sku}))} value={pof.sku} onChange={(e:any)=>setPof(p=>({...p,sku:e.target.value}))} />
          <Input label="Quantity *" placeholder="10" value={pof.qty} onChange={e=>setPof(p=>({...p,qty:e.target.value}))} required />
          <Select label="Supplier" options={suppliers.map(s=>({label:s.name,value:s.name}))} value={pof.supplier} onChange={(e:any)=>setPof(p=>({...p,supplier:e.target.value}))} />
          <Button variant="primary" type="submit" className="w-full mt-2" style={{backgroundColor:"#8B5CF6",color:"white"}}>Authorize PO</Button>
        </form>
      </Modal>
      <Modal isOpen={newIssueOpen} onClose={() => setNewIssueOpen(false)} title="Issue Parts to Ticket">
        <form onSubmit={addIssue} className="flex flex-col gap-3 font-body">
          <Input label="Ticket ID *" placeholder="RF-100247" value={isf.ticketId} onChange={e=>setIsf(i=>({...i,ticketId:e.target.value}))} required />
          <Select label="Product SKU" options={products.map(p=>({label:`${p.sku} — ${p.name} (Stock: ${p.stock})`,value:p.sku}))} value={isf.sku} onChange={(e:any)=>setIsf(i=>({...i,sku:e.target.value}))} />
          <Input label="Quantity *" placeholder="1" value={isf.qty} onChange={e=>setIsf(i=>({...i,qty:e.target.value}))} required />
          <Button variant="primary" type="submit" className="w-full mt-2" style={{backgroundColor:"#8B5CF6",color:"white"}}>Deduct &amp; Issue</Button>
        </form>
      </Modal>
    </div>
  );
};
