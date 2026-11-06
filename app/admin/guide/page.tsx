"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import type { GuideConfig, GuideStep } from "@/lib/guide";

export default function AdminGuideEditorPage() {
  const [guide, setGuide] = useState<GuideConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fetchGuide = async () => {
    try {
      const res = await fetch("/api/guide");
      if (res.ok) {
        const data = await res.json();
        setGuide(data.guide);
      }
    } catch (err) {
      console.error("Failed to load guide:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide();
  }, []);

  const handleSave = async () => {
    if (!guide) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/admin/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus("Guide published successfully! Paying users now see this live.");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        alert(data.error || "Failed to save guide");
      }
    } catch {
      alert("Error saving guide");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    if (!guide) return;
    const newStepNumber = guide.steps.length + 1;
    const newStep: GuideStep = {
      id: `step-${Date.now()}`,
      stepNumber: newStepNumber,
      title: `Step ${newStepNumber}: Action Title`,
      subtitle: "Configuration",
      instructions: "Enter your click-by-click instructions here...",
      imageUrl: "",
      clickHighlight: "Highlight: Specify what to click here.",
    };
    setGuide({ ...guide, steps: [...guide.steps, newStep] });
  };

  const handleRemoveStep = (index: number) => {
    if (!guide) return;
    if (!confirm("Are you sure you want to delete this step?")) return;
    const updated = guide.steps
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setGuide({ ...guide, steps: updated });
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if (!guide) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guide.steps.length) return;

    const copy = [...guide.steps];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const renumbered = copy.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setGuide({ ...guide, steps: renumbered });
  };

  const handleStepChange = (index: number, field: keyof GuideStep, value: string) => {
    if (!guide) return;
    const updated = [...guide.steps];
    updated[index] = { ...updated[index], [field]: value };
    setGuide({ ...guide, steps: updated });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/guide/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        handleStepChange(index, "imageUrl", data.url);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch {
      alert("Error uploading screenshot");
    } finally {
      setUploadingIndex(null);
    }
  };

  if (loading || !guide) {
    return (
      <div className="py-24 flex justify-center">
        <RefreshCw className="w-8 h-8 text-[#66c0f4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a475e]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#66c0f4]" /> Setup Guide Visual Editor
          </h1>
          <p className="text-xs text-[#8f98a0] mt-0.5">
            Manage the visual, click-by-click instructions and screenshots unlocked by paying users on their dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#16202d] border border-[#2a475e] rounded p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded font-bold transition-colors ${
                activeTab === "editor" ? "bg-[#2a475e] text-white" : "text-[#8f98a0] hover:text-white"
              }`}
            >
              Editor View
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === "preview" ? "bg-[#2a475e] text-white" : "text-[#8f98a0] hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-steam-cta text-xs px-5 py-2.5 rounded font-bold flex items-center gap-1.5 shadow-ctaGlow"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Publish Guide</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded flex items-center gap-2 text-xs text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {activeTab === "editor" ? (
        <div className="space-y-6">
          {/* Global Guide Info & Protection Controls */}
          <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#66c0f4]" /> Guide Header & Privacy Protection Settings
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                Active for Paid Users
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8f98a0] uppercase">Guide Headline</label>
                <input
                  type="text"
                  value={guide.title}
                  onChange={(e) => setGuide({ ...guide, title: e.target.value })}
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8f98a0] uppercase">Subtitle / Description</label>
                <input
                  type="text"
                  value={guide.description}
                  onChange={(e) => setGuide({ ...guide, description: e.target.value })}
                  className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                />
              </div>
            </div>

            {/* Anti-Copy & Anti-Leak Toggles */}
            <div className="pt-2 border-t border-[#2a475e]/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#c7d5e0]">
              <label className="flex items-center gap-2 cursor-pointer bg-[#16202d] border border-[#2a475e]/60 p-2.5 rounded">
                <input
                  type="checkbox"
                  checked={guide.protection?.disableCopy ?? true}
                  onChange={(e) =>
                    setGuide({
                      ...guide,
                      protection: { ...guide.protection, disableCopy: e.target.checked },
                    })
                  }
                  className="rounded border-[#2a475e] text-[#66c0f4] focus:ring-0"
                />
                <div>
                  <strong className="block text-white text-[11px]">Disable Text Selection</strong>
                  <span className="text-[10px] text-[#8f98a0]">Prevents copying guide steps</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#16202d] border border-[#2a475e]/60 p-2.5 rounded">
                <input
                  type="checkbox"
                  checked={guide.protection?.disableRightClick ?? true}
                  onChange={(e) =>
                    setGuide({
                      ...guide,
                      protection: { ...guide.protection, disableRightClick: e.target.checked },
                    })
                  }
                  className="rounded border-[#2a475e] text-[#66c0f4] focus:ring-0"
                />
                <div>
                  <strong className="block text-white text-[11px]">Disable Right-Click</strong>
                  <span className="text-[10px] text-[#8f98a0]">Blocks image saving / inspect</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-[#16202d] border border-[#2a475e]/60 p-2.5 rounded">
                <input
                  type="checkbox"
                  checked={guide.protection?.watermark ?? true}
                  onChange={(e) =>
                    setGuide({
                      ...guide,
                      protection: { ...guide.protection, watermark: e.target.checked },
                    })
                  }
                  className="rounded border-[#2a475e] text-[#66c0f4] focus:ring-0"
                />
                <div>
                  <strong className="block text-white text-[11px]">Anti-Leak Watermark</strong>
                  <span className="text-[10px] text-[#8f98a0]">Displays user email on images</span>
                </div>
              </label>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Walkthrough Steps ({guide.steps.length} Steps)
              </h2>
              <button
                onClick={handleAddStep}
                className="btn-steam-panel text-xs px-3.5 py-1.5 rounded font-bold border border-[#2a475e] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#66c0f4]" /> Add New Step
              </button>
            </div>

            {guide.steps.map((step, index) => (
              <div
                key={step.id || index}
                className="bg-[#171a21] border border-[#2a475e] rounded-lg p-5 space-y-4 shadow-sm"
              >
                {/* Step Top Bar: Step Number + Reorder + Delete */}
                <div className="flex items-center justify-between border-b border-[#2a475e]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-sm bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                      {step.stepNumber}
                    </span>
                    <strong className="text-white text-sm">Step {step.stepNumber}</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStep(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-[#8f98a0] hover:text-white disabled:opacity-30 rounded"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveStep(index, "down")}
                      disabled={index === guide.steps.length - 1}
                      className="p-1.5 text-[#8f98a0] hover:text-white disabled:opacity-30 rounded"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded ml-2"
                      title="Delete Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Step Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8f98a0] uppercase">Step Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      placeholder="e.g. Step 1: Open the Application"
                      className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8f98a0] uppercase">Action / Click Highlight Note</label>
                    <input
                      type="text"
                      value={step.clickHighlight || ""}
                      onChange={(e) => handleStepChange(index, "clickHighlight", e.target.value)}
                      placeholder="e.g. Click: 'Fetch' button in blue highlighted in red box"
                      className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8f98a0] uppercase">
                    Step Instructions (Markdown or Plain Text)
                  </label>
                  <textarea
                    rows={3}
                    value={step.instructions}
                    onChange={(e) => handleStepChange(index, "instructions", e.target.value)}
                    placeholder="Enter detailed step-by-step instructions for the user..."
                    className="w-full bg-[#16202d] border border-[#2a475e] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#66c0f4] font-mono leading-relaxed"
                  />
                </div>

                {/* Screenshot Uploader & URL Input */}
                <div className="bg-[#16202d] border border-[#2a475e]/60 rounded p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-white uppercase flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#66c0f4]" /> Step Screenshot / Visual Illustration
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="btn-steam-panel px-3 py-1 rounded text-[11px] font-bold border border-[#2a475e] cursor-pointer flex items-center gap-1.5 hover:text-white">
                        <Upload className="w-3 h-3 text-[#66c0f4]" />
                        <span>{uploadingIndex === index ? "Uploading..." : "Upload Screenshot File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          disabled={uploadingIndex === index}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={step.imageUrl || ""}
                      onChange={(e) => handleStepChange(index, "imageUrl", e.target.value)}
                      placeholder="Or paste direct image URL (e.g. /guide/screenshot.png or https://...)"
                      className="w-full bg-[#121922] border border-[#2a475e] rounded px-3 py-2 text-xs text-[#c7d5e0] focus:outline-none focus:border-[#66c0f4]"
                    />
                  </div>

                  {/* Screenshot Thumbnail Preview */}
                  {step.imageUrl && (
                    <div className="relative aspect-[16/9] max-w-md rounded overflow-hidden border border-[#2a475e] bg-black/60 group">
                      <Image src={step.imageUrl} alt={step.title} fill className="object-contain" />
                      <button
                        onClick={() => handleStepChange(index, "imageUrl", "")}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Screenshot"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddStep}
              className="w-full py-4 border-2 border-dashed border-[#2a475e] hover:border-[#66c0f4] rounded-lg text-xs font-bold text-[#8f98a0] hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#66c0f4]" /> Add Another Walkthrough Step
            </button>
          </div>
        </div>
      ) : (
        /* LIVE PREVIEW TAB */
        <div className="bg-[#171a21] border border-[#2a475e] rounded-lg p-6 sm:p-8 space-y-8 select-none">
          <div className="border-b border-[#2a475e]/60 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
              Verified User View
            </span>
            <h2 className="text-2xl font-black text-white mt-2">{guide.title}</h2>
            <p className="text-xs text-[#8f98a0] mt-1">{guide.description}</p>
          </div>

          <div className="space-y-6">
            {guide.steps.map((step) => (
              <div
                key={step.id}
                className="bg-[#1b2838] border border-[#2a475e] rounded-sm p-6 space-y-4 shadow-md"
              >
                <div className="flex items-center gap-3 border-b border-[#2a475e]/40 pb-3">
                  <span className="w-7 h-7 rounded-sm bg-[#66c0f4] text-[#171a21] font-black flex items-center justify-center text-xs">
                    {step.stepNumber}
                  </span>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                </div>

                <p className="text-xs text-[#c7d5e0] leading-relaxed whitespace-pre-line">
                  {step.instructions}
                </p>

                {step.clickHighlight && (
                  <div className="bg-[#16202d] border-l-2 border-[#66c0f4] p-3 text-xs text-[#66c0f4] rounded-r font-semibold">
                    {step.clickHighlight}
                  </div>
                )}

                {step.imageUrl && (
                  <div className="relative aspect-[16/9] w-full rounded border border-[#2a475e] overflow-hidden bg-black/60 shadow-lg">
                    <Image src={step.imageUrl} alt={step.title} fill className="object-contain" />
                    {guide.protection?.watermark && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                        <span className="text-3xl font-black text-white rotate-[-15deg]">
                          CONFIDENTIAL · STEAMER VAULT
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
