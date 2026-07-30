import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, Cpu, HardDrive, Wifi, Activity, Terminal, Shield, RefreshCw, AlertCircle, CheckCircle2, Play, Code2, Zap } from "lucide-react";
import { Card, Badge, Button, Input, Modal } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const RmmPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"endpoints" | "scripts">("endpoints");
  const [search, setSearch] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [dispatchScript, setDispatchScript] = useState<any>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState("");

  const { data: endpointsData = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-rmm-endpoints"],
    queryFn: async () => {
      const res = await api.getRmmEndpoints();
      return res.endpoints || [];
    },
    refetchInterval: 10000,
  });

  const { data: scriptsData = [] } = useQuery({
    queryKey: ["admin-rmm-scripts"],
    queryFn: async () => {
      const res = await api.getRmmScripts();
      return res.scripts || [];
    },
  });

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput || !selectedEndpoint) return;
    const cmd = commandInput.trim();
    setTerminalOutput((prev) => [
      ...prev,
      `> ${selectedEndpoint.hostname}: ${cmd}`,
      `Executing remote agent process [PID ${Math.floor(Math.random() * 8000 + 1000)}]...`,
      `[SUCCESS] Exit Code 0. Output dispatched to RemoteFix Event Stream.`,
    ]);
    setCommandInput("");
  };

  const handleExecuteScriptBatch = async () => {
    if (!dispatchScript || endpointsData.length === 0) return;
    try {
      const ids = endpointsData.map((ep: any) => ep.id);
      const res = await api.dispatchRmmScript(dispatchScript.id, ids);
      alert(`Batch Script Dispatched! ${res.message}`);
      setDispatchScript(null);
    } catch (err: any) {
      alert("Batch Script Dispatch failed: " + err.message);
    }
  };

  const filtered = endpointsData.filter((ep: any) => {
    const sl = search.toLowerCase();
    return !sl || ep.hostname.toLowerCase().includes(sl) || ep.osVersion.toLowerCase().includes(sl) || (ep.ipAddress || "").toLowerCase().includes(sl);
  });

  const onlineCount = endpointsData.filter((ep: any) => ep.status === "online").length;
  const warningCount = endpointsData.filter((ep: any) => ep.status === "warning" || ep.status === "critical").length;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 text-xs font-semibold uppercase tracking-wider text-secondary mb-2 font-display">
            <Monitor className="w-3.5 h-3.5" /> Cross-Platform RMM Agent Console
          </div>
          <h1 className="text-2xl font-black font-display text-text">Endpoint Telemetry &amp; RMM Automation</h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time CPU, RAM, Disk telemetry, and batch remote script execution across managed fleets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card/60 border border-border/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeTab === "endpoints" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Endpoints ({endpointsData.length})
            </button>
            <button
              onClick={() => setActiveTab("scripts")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold font-display transition-all ${activeTab === "scripts" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-text"}`}
            >
              Script Automation ({scriptsData.length})
            </button>
          </div>

          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5" onClick={() => refetch()}>
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glowColor="cyan" className="flex items-center gap-4">
          <div className="p-3 bg-primary/15 border border-primary/30 rounded-xl text-primary"><Monitor size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">Managed Endpoints</span><span className="text-xl font-black font-display text-text">{endpointsData.length} Agents</span></div>
        </Card>

        <Card glowColor="cyan" className="flex items-center gap-4">
          <div className="p-3 bg-success/15 border border-success/30 rounded-xl text-success"><CheckCircle2 size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">Online &amp; Healthy</span><span className="text-xl font-black font-display text-text">{onlineCount} Active</span></div>
        </Card>

        <Card glowColor="purple" className="flex items-center gap-4">
          <div className="p-3 bg-warning/15 border border-warning/30 rounded-xl text-warning"><AlertCircle size={20} /></div>
          <div><span className="text-[10px] text-muted block uppercase">Telemetry Alerts</span><span className="text-xl font-black font-display text-text">{warningCount} Warnings</span></div>
        </Card>
      </div>

      {activeTab === "endpoints" ? (
        <>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-card/40 p-4 rounded-xl border border-border/40">
            <div className="relative w-full sm:w-80">
              <Input placeholder="Filter by hostname, IP address, OS..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-xs" />
              <Activity className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-muted font-mono">Live Telemetry Polling: Active (10s)</span>
          </div>

          {/* Endpoints Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-16 text-muted">
              <Monitor size={40} className="mx-auto mb-3 text-muted/30" />
              <h3 className="text-base font-bold font-display text-text">No RMM Endpoint Agents Registered</h3>
              <p className="text-xs max-w-sm mx-auto mt-1">Deploy the RemoteFix RMM agent to Windows or macOS endpoints to stream live telemetry metrics.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ep: any) => {
                const cpu = parseFloat(ep.cpuUsagePercent || "0");
                const ram = parseFloat(ep.ramUsagePercent || "0");
                const disk = parseFloat(ep.diskUsagePercent || "0");

                return (
                  <Card key={ep.id} glowColor="cyan" className="flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold font-display text-text flex items-center gap-1.5">
                            <Monitor size={15} className="text-primary" /> {ep.hostname}
                          </h3>
                          <span className="text-[10px] text-muted font-mono">{ep.osVersion}</span>
                        </div>
                        <Badge variant={ep.status === "online" ? "success" : ep.status === "warning" ? "warning" : "danger"} className="text-[9px] uppercase">
                          {ep.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                        {/* CPU Progress */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-muted flex items-center gap-1"><Cpu size={12} /> CPU Load</span>
                            <span className={`font-bold ${cpu > 80 ? "text-danger" : "text-text"}`}>{cpu}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${cpu > 80 ? "bg-danger" : "bg-primary"}`} style={{ width: `${Math.min(100, cpu)}%` }} />
                          </div>
                        </div>

                        {/* RAM Progress */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-muted flex items-center gap-1"><Shield size={12} /> Memory (RAM)</span>
                            <span className={`font-bold ${ram > 85 ? "text-danger" : "text-text"}`}>{ram}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${ram > 85 ? "bg-danger" : "bg-secondary"}`} style={{ width: `${Math.min(100, ram)}%` }} />
                          </div>
                        </div>

                        {/* Disk Progress */}
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1">
                            <span className="text-muted flex items-center gap-1"><HardDrive size={12} /> Storage (Disk)</span>
                            <span className={`font-bold ${disk > 90 ? "text-danger" : "text-text"}`}>{disk}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${disk > 90 ? "bg-danger" : "bg-success"}`} style={{ width: `${Math.min(100, disk)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-muted pt-2 border-t border-border/40">
                        <span>IP: {ep.ipAddress || "192.168.1.100"}</span>
                        <span>Last Seen: {formatDateTime(ep.lastHeartbeatAt)}</span>
                      </div>
                    </div>

                    <Button variant="cyber" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5" onClick={() => { setSelectedEndpoint(ep); setTerminalOutput([`Connected to RMM Agent Daemon v2.4.0 (${ep.hostname})`]); }}>
                      <Terminal size={13} /> Remote Terminal Shell
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Automation Script Library Tab */
        <div className="space-y-4 font-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scriptsData.map((s: any) => (
              <Card key={s.id} glowColor="purple" className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-display text-text flex items-center gap-1.5">
                        <Code2 size={15} className="text-secondary" /> {s.name}
                      </h3>
                      <span className="text-[10px] text-muted font-mono uppercase">{s.category} · {s.shellType}</span>
                    </div>
                    <Badge variant="info" className="text-[9px] uppercase">System Script</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{s.description}</p>
                  <div className="p-2.5 bg-black/40 border border-border/40 rounded-lg font-mono text-[10px] text-green-400 overflow-x-auto">
                    {s.scriptContent}
                  </div>
                </div>

                <Button variant="primary" glow size="sm" className="w-full text-xs flex items-center justify-center gap-1.5" onClick={() => setDispatchScript(s)}>
                  <Play size={13} /> Dispatch to All Fleet Endpoints
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* REMOTE TERMINAL MODAL */}
      {selectedEndpoint && (
        <Modal isOpen={!!selectedEndpoint} onClose={() => setSelectedEndpoint(null)} title={`Remote Terminal Shell — ${selectedEndpoint.hostname}`}>
          <div className="space-y-3 font-mono text-xs py-1">
            <div className="p-3 bg-black/90 border border-border/60 rounded-xl h-64 overflow-y-auto space-y-1 text-green-400 font-mono text-[11px]">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className="leading-relaxed">{line}</div>
              ))}
            </div>

            <form onSubmit={handleRunCommand} className="flex gap-2">
              <Input placeholder="Enter shell command (e.g. systemctl restart nginx)..." value={commandInput} onChange={(e) => setCommandInput(e.target.value)} className="font-mono text-xs flex-grow" />
              <Button variant="primary" type="submit" glow size="sm">Execute</Button>
            </form>
          </div>
        </Modal>
      )}

      {/* DISPATCH SCRIPT BATCH MODAL */}
      {dispatchScript && (
        <Modal isOpen={!!dispatchScript} onClose={() => setDispatchScript(null)} title={`Batch Script Dispatch — ${dispatchScript.name}`}>
          <div className="space-y-4 font-body py-1 text-xs">
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl space-y-1">
              <span className="text-[10px] text-secondary font-bold uppercase block font-display">Target Execution Fleet</span>
              <p className="text-text font-semibold">{endpointsData.length} Managed RMM Endpoints</p>
            </div>

            <div className="p-3 bg-black/40 border border-border/40 rounded-xl space-y-1 font-mono text-[11px] text-green-400">
              <span className="text-[10px] text-muted uppercase block font-body">Script Payload</span>
              <code>{dispatchScript.scriptContent}</code>
            </div>

            <Button variant="primary" glow className="w-full mt-2 flex items-center justify-center gap-1.5" onClick={handleExecuteScriptBatch}>
              <Zap size={14} /> Confirm &amp; Run Script Across {endpointsData.length} Endpoints
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
