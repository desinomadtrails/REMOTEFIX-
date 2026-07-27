import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { Card } from "@remotefix/ui";
import { api } from "../../api.js";
import { formatDateTime } from "@remotefix/utils";

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded ${className}`} />
);

export const LogsPage: React.FC = () => {
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => { const r = await api.getAuditLogs(); return r.logs || []; },
  });

  if (isLoading) return (
    <Card className="p-6">
      <div className="space-y-3">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
    </Card>
  );

  return (
    <div className="font-body space-y-4">
      <div className="flex items-center gap-2">
        <Terminal size={17} className="text-secondary" />
        <h2 className="text-lg font-bold font-display text-text">Security Audit Logs</h2>
        <span className="text-xs text-muted ml-2">({(logsData || []).length} entries)</span>
      </div>

      {(!logsData || logsData.length === 0) ? (
        <Card className="text-center py-20 text-muted">
          <Terminal size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">No audit logs found.</p>
          <p className="text-xs mt-1">Actions taken in the platform will be recorded here.</p>
        </Card>
      ) : (
        <Card glowColor="none" className="p-5 overflow-x-auto">
          <table className="w-full text-xs text-left text-muted border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-text font-bold font-display uppercase text-[10px]">
                {["Action", "IP Address", "Actor", "Details", "Timestamp"].map(h => (
                  <th key={h} className="pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logsData || []).map((log: any) => (
                <tr key={log.id} className="border-b border-border/20 hover:bg-white/3 transition-colors group">
                  <td className="py-3 pr-4 font-bold text-primary whitespace-nowrap">{log.action}</td>
                  <td className="py-3 pr-4 font-mono text-[10px]">{log.ipAddress || "127.0.0.1"}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {log.userEmail ? (
                      <span>{log.userEmail} <span className="text-[9px] text-muted">({log.userRole})</span></span>
                    ) : (
                      <span className="text-muted italic">System / Guest</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 whitespace-nowrap text-[10px] font-mono">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
