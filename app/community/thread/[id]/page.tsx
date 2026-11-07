"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Send,
  Lock,
  Pin,
  RefreshCw,
} from "lucide-react";

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params?.id as string;

  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchThread = () => {
    if (!threadId) return;
    fetch(`/api/community/thread/${threadId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.thread) setThread(data.thread);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/community/thread/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post reply");
      }

      setReplyContent("");
      fetchThread();
    } catch (err: any) {
      setReplyError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Thread not found</h2>
        <Link href="/community" className="btn-steam-cta px-4 py-2 rounded text-xs font-bold inline-block">
          Return to Community Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-xs text-[#8f98a0] hover:text-[#66c0f4]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Discussions
      </Link>

      {/* Main Thread Card */}
      <div className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 sm:p-8 space-y-4 shadow-panelGlow">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2a475e]/60 pb-3">
          {thread.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <span className="text-xs font-semibold text-[#66c0f4] bg-[#66c0f4]/10 px-2 py-0.5 rounded">
            {thread.category}
          </span>
          {thread.game && (
            <span className="text-xs text-[#8f98a0]">
              Game: <strong className="text-white">{thread.game.title}</strong>
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white">{thread.title}</h1>
        <div className="text-xs text-[#8f98a0]">
          Posted by <strong className="text-white">{thread.author?.profile?.displayName || "Gamer"}</strong> on{" "}
          {new Date(thread.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Posts / Replies List */}
      <div className="space-y-4">
        {thread.posts?.map((post: any, idx: number) => (
          <div
            key={post.id}
            className="bg-[#171a21] border border-[#2a475e] rounded-xl p-5 sm:p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs border-b border-[#2a475e]/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {post.author?.profile?.displayName || "Gamer"}
                </span>
                {post.author?.role === "ADMIN" && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded">
                    ADMIN
                  </span>
                )}
                <span className="text-[#8f98a0] text-[11px]">
                  #{idx + 1} · {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#c7d5e0] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {thread.isLocked ? (
        <div className="bg-[#16202d] border border-[#2a475e] p-4 rounded-xl flex items-center justify-center gap-2 text-xs text-[#8f98a0]">
          <Lock className="w-4 h-4" /> This thread has been locked from further replies.
        </div>
      ) : (
        <form onSubmit={handlePostReply} className="bg-[#171a21] border border-[#2a475e] rounded-xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Leave a Reply</h3>

          {replyError && (
            <div className="bg-red-950/60 border border-red-500/50 p-3 rounded text-xs text-red-200">
              {replyError}
            </div>
          )}

          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            placeholder="Write your response... (Safety filter active: Steam Guard codes are prohibited)"
            required
            className="w-full bg-[#16202d] border border-[#2a475e] rounded-lg p-3.5 text-base sm:text-xs text-white focus:outline-none focus:border-[#66c0f4]"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="btn-steam-cta px-6 py-2.5 rounded text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

