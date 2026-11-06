"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Search,
} from "lucide-react";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVerifications = () => {
    fetch("/api/admin/verifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.verifications) setVerifications(data.verifications);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: id, action }),
      });
      if (res.ok) fetchVerifications();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#5ba32b]" /> WHATSAPP NUMBER VERIFICATIONS QUEUE
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Review incoming verification codes sent by renters on WhatsApp per Addendum 3b.
          </p>
        </div>

        <button
          onClick={fetchVerifications}
          className="btn-steam-panel px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 border border-[#2a475e]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No contact verification requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Renter</th>
                  <th className="p-4">WhatsApp Number</th>
                  <th className="p-4">Verification Code</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {verifications.map((v) => {
                  const cleanPhone = (v.user?.whatsappNumber || "").replace(/\D/g, "");
                  const isPending = v.status === "PENDING";

                  return (
                    <tr key={v.id} className="hover:bg-[#1b2838]/50">
                      <td className="p-4">
                        <span className="font-bold text-white block">{v.user?.profile?.displayName}</span>
                        <span className="text-[10px] text-[#8f98a0]">{v.user?.email}</span>
                      </td>

                      <td className="p-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{v.user?.whatsappNumber}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#66c0f4] hover:underline text-[10px] flex items-center gap-0.5"
                            >
                              Chat <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-black text-[#66c0f4] text-sm">
                        {v.code}
                      </td>

                      <td className="p-4 text-[11px] text-[#8f98a0]">
                        {new Date(v.requestedAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            v.status === "VERIFIED"
                              ? "bg-[#5ba32b]/20 text-[#5ba32b]"
                              : v.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(v.id, "VERIFY")}
                              disabled={actionLoading === v.id}
                              className="btn-steam-cta px-3 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Verified
                            </button>
                            <button
                              onClick={() => handleAction(v.id, "REJECT")}
                              disabled={actionLoading === v.id}
                              className="bg-red-600/80 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#8f98a0]">
                            Verified by {v.verifiedBy || "Admin"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

