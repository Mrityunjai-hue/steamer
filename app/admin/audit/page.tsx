"use client";

import React, { useState, useEffect } from "react";
import { History, RefreshCw, Search } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = () => {
    fetch("/api/admin/audit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return l.action.toLowerCase().includes(term) || l.targetType.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-[#66c0f4]" /> IMMUTABLE AUDIT LOG
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Append-only security log tracking every administrative verification, grant, strike, and setting modification.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="btn-steam-panel px-3 py-1.5 rounded text-xs font-bold border border-[#2a475e] flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
        </button>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type & ID</th>
                  <th className="p-4">Metadata Payload</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1b2838]/50">
                    <td className="p-4 font-bold text-white font-mono">
                      <span className="bg-[#2a475e] px-2 py-0.5 rounded text-[#66c0f4]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[#8f98a0]">{log.targetType}</span>
                      {log.targetId && (
                        <span className="font-mono text-white block">{log.targetId}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-[#8f98a0] max-w-sm truncate" title={log.metadataJson || ""}>
                      {log.metadataJson || "—"}
                    </td>
                    <td className="p-4 text-right text-[11px] text-[#8f98a0]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

