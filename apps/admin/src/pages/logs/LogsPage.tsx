import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Terminal, Search, Download, Shield, Eye, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Card, Badge, Button, Input, Modal, Select } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export const LogsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logsData = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => { const r = await api.getAuditLogs(); return r.logs || []; },
  });

  const handleExportCsv = () => {
    window.open("/api/admin/logs/export-csv", "_blank");
  };

  const filteredLogs = logsData.filter((log: any) => {
    const sl = search.toLowerCase();
    const matchSearch = !sl || log.action.toLowerCase().includes(sl) || (log.details || "").toLowerCase().includes(sl) || (log.userEmail || "").toLowerCase().includes(sl) || (log.ipAddress || "").includes(sl);
    const matchStatus = statusFilter === "all" || (log.status || "success") === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="space-y-4 font-body">
      <Skeleton className="h-16" />
      <Skeleton className="h-96" />
    </div>
  );

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider text-primary mb-2 font-display">
            <Shield className="w-3.5 h-3.5" /> Immutable Security Audit Logs
          </div>
          <h1 className="text-2xl font-black font-display text-text">Enterprise Action &amp; Audit Trail</h1>
          <p className="text-xs text-muted mt-0.5">
            Permanent record of authentication events, tenant configuration mutations, and technician dispatches.
          </p>
        </div>

        <Button variant="outline" size="sm" className="text-xs flex items-center gap-2" onClick={handleExportCsv}>
          <Download size={14} /> Export Audit CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/40 p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Input placeholder="Search action, user email, IP, details..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-xs" />
          <Search className="absolute left-3 top-3.5 text-muted w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            options={[
              { value: "all", label: "All Audit Statuses" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
            ]}
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="text-xs w-full sm:w-44"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <Card className="text-center py-20 text-muted">
          <Terminal size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No audit log entries match your filters.</p>
        </Card>
      ) : (
        <Card glowColor="none" className="p-0 overflow-hidden border border-border/40">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-body">
              <thead className="bg-card/60 text-muted uppercase text-[10px] font-bold border-b border-border/40">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{log.action}</td>
                    <td className="px-4 py-3">
                      <Badge variant={(log.status || "success") === "success" ? "success" : "danger"} className="text-[9px] uppercase">
                        {log.status || "success"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-text">
                      {log.userEmail ? (
                        <span>{log.userEmail} <span className="text-[10px] text-muted font-normal">({log.userRole || "User"})</span></span>
                      ) : (
                        <span className="text-muted italic">System / Anonymous</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-muted">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="text-[10px] py-1 text-secondary" onClick={() => setSelectedLog(log)}>
                        <Eye size={13} /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* INSPECT AUDIT ENTRY MODAL */}
      {selectedLog && (
        <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title={`Audit Entry — ${selectedLog.action}`}>
          <div className="space-y-4 font-body py-1 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-black/30 border border-border/40 rounded-xl font-mono text-[11px]">
              <div><span className="text-muted block text-[10px] uppercase">Audit ID:</span><span className="text-text font-bold select-all">{selectedLog.id}</span></div>
              <div><span className="text-muted block text-[10px] uppercase">Actor Email:</span><span className="text-primary font-bold">{selectedLog.userEmail || "System"}</span></div>
              <div><span className="text-muted block text-[10px] uppercase">IP Address:</span><span className="text-text">{selectedLog.ipAddress || "127.0.0.1"}</span></div>
              <div><span className="text-muted block text-[10px] uppercase">Timestamp:</span><span className="text-text">{formatDateTime(selectedLog.createdAt)}</span></div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">Summary &amp; Context</span>
              <p className="text-text font-semibold p-3 bg-card/60 border border-border/40 rounded-xl">{selectedLog.details}</p>
            </div>

            {selectedLog.oldValuesJson && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase font-bold block">Previous State Payload (JSON)</span>
                <pre className="p-3 bg-black/60 border border-border/40 rounded-xl font-mono text-[10px] text-warning overflow-x-auto">
                  {selectedLog.oldValuesJson}
                </pre>
              </div>
            )}

            {selectedLog.newValuesJson && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase font-bold block">Mutated State Payload (JSON)</span>
                <pre className="p-3 bg-black/60 border border-border/40 rounded-xl font-mono text-[10px] text-success overflow-x-auto">
                  {selectedLog.newValuesJson}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
