"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
} from "lucide-react";
import { brandConfig } from "@/config/brand";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // New Ticket Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState("LOGIN_HELP");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reply in ticket
  const [replyMessage, setReplyMessage] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = () => {
    fetch("/api/support/tickets")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tickets) {
          setTickets(data.tickets);
          if (data.tickets.length > 0 && !activeTicket) {
            loadTicketDetails(data.tickets[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const loadTicketDetails = (id: string) => {
    fetch(`/api/support/tickets/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ticket) setActiveTicket(data.ticket);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setSubject("");
        setMessage("");
        fetchTickets();
        if (data?.ticket) loadTicketDetails(data.ticket.id);
      } else {
        alert(data.error || "Failed to create ticket");
      }
    } catch {
      alert("Error creating ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      if (res.ok) {
        setReplyMessage("");
        loadTicketDetails(activeTicket.id);
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-[#66c0f4]" /> HELP CENTER & TICKETS
          </h1>
          <p className="text-xs sm:text-sm text-[#8f98a0]">
            Direct owner support for setup issues, offline mode, game crashes, and billing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-steam-cta text-xs px-4 py-2 rounded font-bold flex items-center gap-1.5 shadow-ctaGlow"
        >
          <Plus className="w-4 h-4" /> Open New Support Ticket
        </button>
      </div>

      {/* Emergency Contact Notice */}
      <div className="bg-[#171a21] border border-[#2a475e] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c7d5e0]">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-[#5ba32b]" />
          <span>
            Need instant assistance? Direct WhatsApp:{" "}
            <a href={brandConfig.whatsappHelpUrl} target="_blank" rel="noreferrer" className="text-[#66c0f4] font-bold hover:underline">
              {brandConfig.whatsappDisplay}
            </a>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#8f98a0]">
          <Mail className="w-4 h-4 text-[#66c0f4]" />
          <span>{brandConfig.supportEmail}</span>
        </div>
      </div>

      {/* Main Two-Column Tickets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-4 bg-[#171a21] border border-[#2a475e] rounded-xl p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8f98a0] block px-1">
            Your Support Inquiries ({tickets.length})
          </span>

          {loading ? (
            <div className="py-12 flex justify-center">
              <RefreshCw className="w-5 h-5 text-[#66c0f4] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8f98a0] space-y-2">
              <p>No support tickets yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#66c0f4] font-bold hover:underline block mx-auto"
              >
                + Open your first ticket
              </button>
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTicketDetails(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  activeTicket?.id === t.id
                    ? "bg-[#2a475e] border-[#66c0f4]/50 shadow-sm"
                    : "bg-[#16202d] border-[#2a475e]/40 hover:bg-[#16202d]/80"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-mono text-[#66c0f4]">{t.ticketNumber}</span>
                  <span
                    className={`font-bold uppercase ${
                      t.status === "OPEN"
                        ? "text-[#5ba32b]"
                        : t.status === "IN_PROGRESS"
                        ? "text-amber-400"
                        : "text-[#8f98a0]"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
                <p className="text-[10px] text-[#8f98a0] mt-1">
                  {t.category} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-8 bg-[#171a21] border border-[#2a475e] rounded-xl p-6 shadow-xl flex flex-col min-h-[500px]">
          {activeTicket ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              {/* Ticket Top Meta */}
              <div className="border-b border-[#2a475e]/60 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#66c0f4]">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] bg-[#2a475e] text-white px-2 py-0.5 rounded uppercase">
                      {activeTicket.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{activeTicket.subject}</h2>
                </div>
                <div className="text-right text-[11px] text-[#8f98a0]">
                  <span>Status: </span>
                  <strong className="text-white uppercase">{activeTicket.status}</strong>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
                {activeTicket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg text-xs leading-relaxed ${
                      msg.senderRole === "ADMIN"
                        ? "bg-[#2a475e]/70 border border-amber-500/30 text-white ml-6"
                        : "bg-[#16202d] border border-[#2a475e]/50 text-[#c7d5e0] mr-6"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#8f98a0] mb-1.5">
                      <span className="font-bold text-[#66c0f4]">
                        {msg.senderRole === "ADMIN" ? "Steamer Support Lead (Admin)" : msg.user?.profile?.displayName || "You"}
                      </span>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="border-t border-[#2a475e]/60 pt-4 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to support..."
                  className="flex-1 bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className="btn-steam-cta px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-xs text-[#8f98a0] space-y-2">
              <MessageSquare className="w-10 h-10 text-[#2a475e]" />
              <p>Select a ticket on the left to read and reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8f98a0] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none"
                >
                  <option value="LOGIN_HELP">Setup Guide & Desktop Launcher Help</option>
                  <option value="OFFLINE_MODE">Steam Offline Mode Assistance</option>
                  <option value="GAME_CRASH">Game Crash / Installation Troubleshooting</option>
                  <option value="BILLING">UPI Billing & Payment Inquiries</option>
                  <option value="OTHER">Other Assistance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Steam is asking for login reconnection"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Message Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Describe what happened, any error messages, and your registered device..."
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#2a475e]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#2a475e] text-white text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-steam-cta px-5 py-2 text-xs font-bold rounded">
                  {submitting ? "Opening..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

