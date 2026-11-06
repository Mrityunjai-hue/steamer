"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Pin,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  AlertTriangle,
  Users,
  Compass,
} from "lucide-react";

export default function CommunityPage() {
  const [tab, setTab] = useState<"FORUM" | "CHAT">("FORUM");
  const [category, setCategory] = useState("ALL");
  const [threads, setThreads] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatRoom, setChatRoom] = useState("general");
  const [loading, setLoading] = useState(true);

  // New Thread Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    { id: "ALL", name: "All Discussions" },
    { id: "ANNOUNCEMENTS", name: "Announcements" },
    { id: "SETUP_HELP", name: "Setup Help" },
    { id: "OFFLINE_HELP", name: "Offline Mode Help" },
    { id: "GAME_HELP", name: "Game Help" },
    { id: "REQUESTS", name: "Game Requests" },
    { id: "GENERAL", name: "General Gaming" },
  ];

  const fetchThreads = () => {
    const url = category === "ALL" ? "/api/community/threads" : `/api/community/threads?category=${category}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.threads) setThreads(data.threads);
      })
      .finally(() => setLoading(false));
  };

  const fetchChat = () => {
    fetch(`/api/community/chat?room=${chatRoom}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.messages) setChatMessages(data.messages);
      });
  };

  useEffect(() => {
    fetchThreads();
  }, [category]);

  useEffect(() => {
    if (tab === "CHAT") {
      fetchChat();
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [tab, chatRoom]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create thread");
      }

      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      fetchThreads();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const res = await fetch("/api/community/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: chatInput.trim(),
          room: chatRoom,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Message rejected by security filter");
        return;
      }

      setChatInput("");
      fetchChat();
    } catch {
      alert("Failed to send message");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Community Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            COMMUNITY & OFFLINE HUB
          </h1>
          <p className="text-xs sm:text-sm text-[#8f98a0]">
            Connect with verified renters, share offline tips, and discuss your favorite games.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[#171a21] border border-[#2a475e] p-1 rounded-lg">
          <button
            onClick={() => setTab("FORUM")}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
              tab === "FORUM" ? "bg-[#2a475e] text-white" : "text-[#8f98a0] hover:text-white"
            }`}
          >
            Discussion Forum
          </button>
          <button
            onClick={() => setTab("CHAT")}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
              tab === "CHAT" ? "bg-[#2a475e] text-white" : "text-[#8f98a0] hover:text-white"
            }`}
          >
            Real-Time Chat Lounge
          </button>
        </div>
      </div>

      {tab === "FORUM" ? (
        /* FORUM VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <aside className="bg-[#171a21] border border-[#2a475e] p-5 rounded-xl space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <span className="text-xs font-bold uppercase text-white">Categories</span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-steam-cta text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Thread
              </button>
            </div>

            <div className="space-y-1 text-xs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    category === c.id
                      ? "bg-[#66c0f4]/20 text-[#66c0f4] font-bold border border-[#66c0f4]/30"
                      : "text-[#c7d5e0] hover:bg-[#2a475e]/40"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="border-t border-[#2a475e]/40 pt-4 text-[11px] text-[#8f98a0] space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5ba32b]" /> Community Guard
              </p>
              <p>Credentials, Steam Guard codes, and piracy links are auto-blocked.</p>
            </div>
          </aside>

          {/* Threads List */}
          <div className="lg:col-span-3 space-y-3">
            {loading ? (
              <div className="py-20 flex justify-center">
                <RefreshCw className="w-6 h-6 text-[#66c0f4] animate-spin" />
              </div>
            ) : threads.length === 0 ? (
              <div className="bg-[#171a21] border border-[#2a475e] p-12 text-center rounded-xl space-y-3">
                <p className="text-white font-bold">No threads found in this category</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-steam-cta text-xs px-4 py-2 rounded font-bold"
                >
                  Start the first conversation
                </button>
              </div>
            ) : (
              threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/community/thread/${t.id}`}
                  className="block bg-[#171a21] hover:bg-[#2a475e]/40 border border-[#2a475e] p-4 rounded-xl transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {t.isPinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-[#66c0f4] bg-[#66c0f4]/10 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                        {t.game && (
                          <span className="text-[10px] text-[#8f98a0] truncate">
                            Game: {t.game.title}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white hover:text-[#66c0f4] truncate">
                        {t.title}
                      </h3>
                      <p className="text-[11px] text-[#8f98a0]">
                        By {t.author.profile?.displayName || "Gamer"} ·{" "}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#8f98a0] bg-[#16202d] px-3 py-1 rounded-full flex-shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t._count.posts}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : (
        /* CHAT LOUNGE VIEW */
        <div className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
          {/* Chat room selector */}
          <div className="bg-[#16202d] border-b border-[#2a475e] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5ba32b] animate-pulse" />
              <span className="text-xs font-bold text-white uppercase">Live Chat Room:</span>
              <select
                value={chatRoom}
                onChange={(e) => setChatRoom(e.target.value)}
                className="bg-[#171a21] border border-[#2a475e] text-xs text-[#66c0f4] font-bold rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="general">General Gaming Lounge</option>
                <option value="setup-lounge">Setup & Download Help</option>
                <option value="offline-gamers">Offline Story Gamers</option>
              </select>
            </div>
            <span className="text-[11px] text-[#8f98a0]">
              Automated code & credential protection active
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8f98a0]">
                No messages yet in this lounge room. Say hello!
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="bg-[#16202d]/80 border border-[#2a475e]/40 p-3 rounded-lg text-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#8f98a0] mb-1">
                    <span className="font-bold text-[#66c0f4]">
                      {msg.author?.profile?.displayName || "Gamer"}
                      {msg.author?.role === "ADMIN" && (
                        <span className="ml-1 text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded font-black">
                          ADMIN
                        </span>
                      )}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#c7d5e0] leading-relaxed break-words">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-3 bg-[#16202d] border-t border-[#2a475e] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message... (never share login codes)"
              className="flex-1 bg-[#171a21] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="btn-steam-cta px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}

      {/* New Thread Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a21] border border-[#2a475e] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <h3 className="text-base font-bold text-white">Create New Discussion Thread</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8f98a0] hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-950/60 border border-red-500/50 p-3 rounded text-xs text-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateThread} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#16202d] border border-[#2a475e] text-xs text-white rounded p-2 focus:outline-none"
                >
                  <option value="GENERAL">General Gaming</option>
                  <option value="SETUP_HELP">Setup Help</option>
                  <option value="OFFLINE_HELP">Offline Mode Help</option>
                  <option value="GAME_HELP">Game Help</option>
                  <option value="REQUESTS">Game Requests</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best graphic settings for Red Dead Redemption 2"
                  required
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white block">Post Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Share details, questions, or setup instructions..."
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
                <button type="submit" className="btn-steam-cta px-5 py-2 text-xs font-bold rounded">
                  Publish Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

