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

  // Helper to determine if it's YouTube, Vimeo, Google Drive, or direct HTML5 video
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");
  const isGoogleDrive = videoUrl.includes("drive.google.com") || videoUrl.includes("docs.google.com");

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
  } else if (isGoogleDrive) {
    const driveMatch =
      videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      videoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const driveId = driveMatch ? driveMatch[1] : "";
    if (driveId) {
      embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }
  }

  return (
    <div
      data-video-player="true"
      className="bg-[#171a21] border border-[#2a475e] -mx-3 sm:mx-0 w-[calc(100%+1.5rem)] sm:w-full rounded-none sm:rounded-xl overflow-hidden shadow-2xl relative select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header bar */}
      <div className="bg-[#1b2838] px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#2a475e] flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#66c0f4]/20 border border-[#66c0f4]/40 flex items-center justify-center text-[#66c0f4]">
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">
              {title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-[#8f98a0]">
              Interactive inline player • Copy, download & recording prohibited
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
          <Shield className="w-3 h-3" /> DRM Protected
        </div>
      </div>

      {/* Video Container with Overlaid Watermark Shield & Anti-Popout Protection */}
      <div className="relative w-full aspect-video min-h-[260px] sm:min-h-[420px] bg-[#000000] overflow-hidden">
        {/* Anti-Popout Top Cap & Corner Shield: Ensures Google Drive's top bar and popout icon can NEVER be clicked */}
        {isGoogleDrive && (
          <>
            <div className="absolute top-0 left-0 right-0 h-10 z-30 bg-[#0b0e14]/95 backdrop-blur-sm flex items-center justify-between px-3.5 pointer-events-auto select-none border-b border-[#2a475e]/40">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Steamer Protected Stream
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#8f98a0]">Inline DRM Protected</span>
            </div>
            {/* Top-Right Shield: Physically intercepts and cancels clicks on the top-right corner where pop-out icon resides */}
            <div
              className="absolute top-0 right-0 w-28 h-14 z-40 bg-transparent pointer-events-auto select-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </>
        )}

        {/* Anti-Screen Recording Dynamic Floating Watermark */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 opacity-20 sm:opacity-25 select-none">
          <div className="text-white font-mono text-[10px] sm:text-xs tracking-widest text-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            🔒 {watermarkText}
          </div>
          <div className="text-white font-mono text-xs sm:text-sm font-bold tracking-widest text-center transform -rotate-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            STEAMER PASS • UNAUTHORIZED SHARING PROHIBITED
          </div>
          <div className="text-white font-mono text-[10px] sm:text-xs tracking-widest text-right drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            🔒 {watermarkText}
          </div>
        </div>

        {embedUrl ? (
          <iframe
            id="guide-video-iframe"
            src={embedUrl}
            title={title}
            className={`w-full border-0 touch-manipulation ${
              isGoogleDrive
                ? "absolute -top-[58px] left-0 h-[calc(100%+58px)]"
                : "h-full"
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
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

      <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#121922] border-t border-[#2a475e]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#8f98a0]">
        <span>⚡ Tap video to play/pause • Rotate phone to landscape for full screen</span>
        <span className="text-[#66c0f4]">Pop-out & External Linking Blocked</span>
      </div>
    </div>
  );
}

