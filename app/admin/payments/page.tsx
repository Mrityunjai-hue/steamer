"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PAYMENT_SUBMITTED");
  const [searchTerm, setSearchTerm] = useState("");

  // Per-order bank confirmation state
  const [confirmedMap, setConfirmedMap] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPayments = () => {
    fetch(`/api/admin/payments?status=${filterStatus}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const handleVerify = async (orderId: string) => {
    if (!confirmedMap[orderId]) {
      alert("Mandatory verification rule: You must check 'I have confirmed this amount in my bank/UPI app' before verifying!");
      return;
    }

    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "VERIFY",
          confirmedInBankApp: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Payment verified and 30-day plan activated!");
        fetchPayments();
      } else {
        alert(data.error || "Failed to verify payment");
      }
    } catch {
      alert("Network error verifying payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingOrder) return;

    setActionLoading(rejectingOrder.orderId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: rejectingOrder.orderId,
          action: "REJECT",
          rejectionReason: rejectReason || "UTR not found in bank account or incorrect amount",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRejectingOrder(null);
        setRejectReason("");
        fetchPayments();
      } else {
        alert(data.error || "Failed to reject payment");
      }
    } catch {
      alert("Network error rejecting payment");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(term) ||
      o.user?.email.toLowerCase().includes(term) ||
      o.submission?.utr?.includes(term) ||
      o.submission?.payerName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#66c0f4]" /> UPI PAYMENTS VERIFICATION QUEUE
          </h1>
          <p className="text-xs text-[#8f98a0]">
            Review direct UPI bank deposits and activate 30-day renter subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["PAYMENT_SUBMITTED", "VERIFIED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                filterStatus === st
                  ? "bg-[#2a475e] text-white"
                  : "bg-[#16202d] text-[#8f98a0] hover:text-white"
              }`}
            >
              {st === "PAYMENT_SUBMITTED" ? "Pending Review" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Security Warning from Addendum 2e */}
      <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Mandatory Verification Policy:</strong> Confirm the money in your own bank/UPI app (GPay/PhonePe/Paytm/BHIM). Do not rely on screenshots alone, as screenshots can be spoofed.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-[#8f98a0] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Order ID, UTR, or email..."
          className="w-full bg-[#171a21] border border-[#2a475e] rounded pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8f98a0]">
            No payment submissions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b24] text-[#8f98a0] border-b border-[#2a475e]/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Renter Details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">UPI UTR & Payer</th>
                  <th className="p-4">Screenshot</th>
                  <th className="p-4">Bank Confirmation</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a475e]/40 text-[#c7d5e0]">
                {filteredOrders.map((order) => {
                  const sub = order.submission;
                  const isPending = order.status === "PAYMENT_SUBMITTED";

                  return (
                    <tr key={order.id} className="hover:bg-[#1b2838]/50">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block">{order.orderId}</span>
                        <span className="text-[10px] text-[#8f98a0]">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-white block">{order.user?.email}</span>
                        <span className="text-[10px] text-[#8f98a0]">
                          {order.user?.profile?.displayName} · {order.user?.whatsappNumber || "No Phone"}
                        </span>
                      </td>

                      <td className="p-4 font-black text-[#5ba32b] text-sm">
                        ₹{order.amount}
                      </td>

                      <td className="p-4">
                        {sub ? (
                          <div>
                            <span className="font-mono font-bold text-amber-300 block tracking-wider">
                              {sub.utr}
                            </span>
                            <span className="text-[10px] text-[#8f98a0]">
                              Payer: <strong className="text-white">{sub.payerName}</strong>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8f98a0] italic">Not submitted</span>
                        )}
                      </td>

                      <td className="p-4">
                        {sub?.screenshotPath ? (
                          <a
                            href={sub.screenshotPath}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#66c0f4] hover:underline flex items-center gap-1 font-semibold"
                          >
                            View Image <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#8f98a0]">None</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isPending ? (
                          <label className="flex items-center gap-2 cursor-pointer bg-[#16202d] border border-[#2a475e] p-2 rounded text-[11px] hover:border-amber-400">
                            <input
                              type="checkbox"
                              checked={!!confirmedMap[order.orderId]}
                              onChange={(e) =>
                                setConfirmedMap((prev) => ({
                                  ...prev,
                                  [order.orderId]: e.target.checked,
                                }))
                              }
                              className="rounded border-[#2a475e] text-[#5ba32b] focus:ring-0 bg-[#171a21]"
                            />
                            <span className="text-white font-medium">
                              I confirmed ₹{order.amount} in my bank app
                            </span>
                          </label>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f98a0]">
                            {order.status}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerify(order.orderId)}
                              disabled={!confirmedMap[order.orderId] || actionLoading === order.orderId}
                              className="btn-steam-cta px-3 py-1.5 rounded text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify & Activate
                            </button>
                            <button
                              onClick={() => setRejectingOrder(order)}
                              disabled={actionLoading === order.orderId}
                              className="bg-red-600/80 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#8f98a0]">
                            {order.status}
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

      {/* Reject Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a21] border border-red-500/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Reject Payment for Order {rejectingOrder.orderId}
            </h3>

            <p className="text-xs text-[#8f98a0]">
              Rejecting this payment will release the reserved slot hold back to the pool. Please state the reason for rejection:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. UTR not found in bank statement, amount mismatch, or duplicate UTR"
              className="w-full bg-[#16202d] border border-[#2a475e] rounded p-2.5 text-xs text-white focus:outline-none focus:border-red-400"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 bg-[#2a475e] text-white text-xs font-bold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold rounded"
              >
                Confirm Rejection & Release Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

