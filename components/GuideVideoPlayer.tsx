"use client";

import React, { useRef } from "react";
import { Video, Shield, Play } from "lucide-react";

interface GuideVideoPlayerProps {
  videoUrl: string;
  title?: string;
  watermarkText?: string;
}

export default function GuideVideoPlayer({
  videoUrl,
  title = "Step-by-Step Video Walkthrough",
  watermarkText = "CONFIDENTIAL • STEAMER PASS",
}: GuideVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) return null;

  // Helper to determine if it's YouTube, Vimeo, or direct HTML5 video
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  let embedUrl = "";
  if (isYouTube) {
    let videoId = "";
    if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (videoUrl.includes("v=")) {
      videoId = videoUrl.split("v=")[1]?.split("&")[0] || "";
    } else if (videoUrl.includes("embed/")) {
      videoId = videoUrl.split("embed/")[1]?.split("?")[0] || "";
    }
    if (videoId) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`;
    }
  } else if (isVimeo) {
    const vimeoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0] || "";
    if (vimeoId) {
      embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
    }
  }

  return (
    <div
      className="bg-[#171a21] border border-[#2a475e] rounded-xl overflow-hidden shadow-2xl relative select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header bar */}
      <div className="bg-[#1b2838] px-5 py-3 border-b border-[#2a475e] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#66c0f4]/20 border border-[#66c0f4]/40 flex items-center justify-center text-[#66c0f4]">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            <p className="text-[10px] text-[#8f98a0]">
              Interactive inline player • Copy, download & recording prohibited
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
          <Shield className="w-3 h-3" /> DRM Protected
        </div>
      </div>

      {/* Video Container with Overlaid Watermark Shield */}
      <div className="relative aspect-video w-full bg-[#0b0e14] overflow-hidden">
        {/* Anti-Screen Recording Dynamic Floating Watermark */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 opacity-[0.08] select-none">
          <div className="text-white font-mono text-xs tracking-widest text-left">
            {watermarkText}
          </div>
          <div className="text-white font-mono text-sm tracking-widest text-center transform -rotate-6">
            PROTECTED STEAMER WALKTHROUGH • NO RECORDING
          </div>
          <div className="text-white font-mono text-xs tracking-widest text-right">
            {watermarkText}
          </div>
        </div>

        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            controlsList="nodownload noplaybackrate nofullscreen"
            disablePictureInPicture
            disableRemotePlayback
            playsInline
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="px-5 py-2.5 bg-[#121922] border-t border-[#2a475e]/60 flex items-center justify-between text-[11px] text-[#8f98a0]">
        <span>⚡ Watch the full walkthrough before performing your client setup.</span>
        <span className="text-[#66c0f4]">Steam Protected Stream</span>
      </div>
    </div>
  );
}
