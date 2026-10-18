import React, { useState } from "react";
import {
  Type,
  Sparkles,
  Flame,
  Check,
  Palette,
  Image as ImageIcon,
  Shield,
  Upload,
  Layers,
  Sliders,
  Maximize2
} from "lucide-react";
import { VideoClip, KaraokeConfig, KaraokeStyle, KaraokePosition, LogoWatermarkConfig, LogoPosition } from "../types";
import { generateDefaultKaraoke } from "../utils/karaokeRenderer";

interface KaraokeStudioProps {
  clip: VideoClip;
  config?: KaraokeConfig;
  logoConfig?: LogoWatermarkConfig;
  onChangeConfig: (newConfig: KaraokeConfig) => void;
  onChangeLogoConfig?: (newLogoConfig: LogoWatermarkConfig) => void;
  onApplyLogoToAll?: (newLogoConfig: LogoWatermarkConfig) => void;
}

export function KaraokeStudio({
  clip,
  config,
  logoConfig,
  onChangeConfig,
  onChangeLogoConfig,
  onApplyLogoToAll
}: KaraokeStudioProps) {
  const [activeTab, setActiveTab] = useState<"subtitles" | "logo">("subtitles");

  // Setup default config if not provided
  const currentConfig: KaraokeConfig = config || {
    enabled: true,
    style: "hormozi",
    position: "bottom",
    fontSize: 28,
    lines: clip.karaokeConfig?.lines || generateDefaultKaraoke(clip)
  };

  // Setup default logo watermark config
  const currentLogoConfig: LogoWatermarkConfig = logoConfig || clip.logoConfig || {
    enabled: false,
    type: "text",
    text: "@CreatorOfficial",
    position: "top-right",
    opacity: 0.85,
    size: 20
  };

  // Exactly ONE single phrase text
  const initialPhrase = currentConfig.lines[0]?.text || generateDefaultKaraoke(clip)[0]?.text || "FEEL THE ENERGY NOW 🔥";
  const [customPhrase, setCustomPhrase] = useState(initialPhrase);
  const [copiedLogoToast, setCopiedLogoToast] = useState(false);

  const handleToggleKaraoke = (enabled: boolean) => {
    onChangeConfig({
      ...currentConfig,
      enabled
    });
  };

  const handleStyleChange = (style: KaraokeStyle) => {
    onChangeConfig({
      ...currentConfig,
      style
    });
  };

  const handlePositionChange = (position: KaraokePosition) => {
    onChangeConfig({
      ...currentConfig,
      position
    });
  };

  // User-Generated Subtitles & Lyric Editor: updates single phrase words across clip duration
  const handleUpdatePhrase = (newText: string) => {
    setCustomPhrase(newText);

    const duration = Math.max(1, clip.endTime - clip.startTime);
    const rawWords = newText.split(/\s+/).filter(Boolean);
    const step = duration / Math.max(1, rawWords.length);

    const words = rawWords.map((w, i) => ({
      word: w,
      startTime: clip.startTime + i * step,
      endTime: clip.startTime + (i + 1) * step
    }));

    // Strictly enforce 1 single phrase
    const newLines = [
      {
        text: newText,
        startTime: clip.startTime,
        endTime: clip.endTime,
        words
      }
    ];

    onChangeConfig({
      ...currentConfig,
      lines: newLines
    });
  };

  // Logo config handlers
  const handleUpdateLogo = (updates: Partial<LogoWatermarkConfig>) => {
    if (!onChangeLogoConfig) return;
    const merged: LogoWatermarkConfig = {
      ...currentLogoConfig,
      ...updates
    };
    onChangeLogoConfig(merged);
  };

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdateLogo({
        type: "image",
        imageUrl: result,
        enabled: true
      });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoAll = () => {
    if (onApplyLogoToAll) {
      onApplyLogoToAll(currentLogoConfig);
      setCopiedLogoToast(true);
      setTimeout(() => setCopiedLogoToast(false), 2500);
    }
  };

  const presetHooks = [
    "FEEL THE ENERGY NOW 🔥",
    "WAIT FOR THE DROP ⚡",
    "THIS HOOK HITS DIFFERENT 🔁",
    "LISTEN CAREFULLY 🎧",
    "SING EVERY WORD ✨"
  ];

  return (
    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-xs">
      {/* Studio Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("subtitles")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "subtitles"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Type className="h-3.5 w-3.5 text-violet-600" />
            <span>Single-Phrase Subtitles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "logo"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Burnt-In Logo / Watermark</span>
            {currentLogoConfig.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Status Pill */}
        <span className="text-[10px] font-mono font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full uppercase">
          Baked into Video
        </span>
      </div>

      {/* TAB 1: SINGLE-PHRASE SUBTITLES (USER-GENERATED LYRIC EDITOR) */}
      {activeTab === "subtitles" && (
        <div className="space-y-3.5 animate-fade-in text-xs">
          {/* Header & ON/OFF Switch */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span>Burned Karaoke Lyrics</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full uppercase">
                  1 Single Phrase Focus
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Only 1 punchy phrase burned at once for maximum viral retention (never on heading)
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.enabled}
                onChange={(e) => handleToggleKaraoke(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>

          {currentConfig.enabled && (
            <div className="space-y-3 pt-1 border-t border-slate-200/60">
              {/* User-Generated Lyric / Phrase Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>Edit Lyric / Custom Subtitle (1 Phrase Only)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {customPhrase.split(/\s+/).filter(Boolean).length} words • {Math.round(clip.endTime - clip.startTime)}s duration
                  </span>
                </div>

                <input
                  type="text"
                  value={customPhrase}
                  onChange={(e) => handleUpdatePhrase(e.target.value)}
                  placeholder="TYPE YOUR EXACT LYRIC OR PHRASE HERE..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none shadow-xs"
                />

                {/* Quick Hook Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                  {presetHooks.map((hook, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleUpdatePhrase(hook)}
                      className="px-2 py-0.5 rounded-md bg-white hover:bg-violet-50 border border-slate-200 text-slate-700 hover:text-violet-700 text-[10px] font-semibold transition cursor-pointer"
                    >
                      {hook}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Visual Style */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Palette className="h-3.5 w-3.5 text-violet-600" />
                  <span>Karaoke Visual Animation</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Hormozi Style */}
                  <button
                    type="button"
                    onClick={() => handleStyleChange("hormozi")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      currentConfig.style === "hormozi"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Hormozi Viral</span>
                      {currentConfig.style === "hormozi" && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[10px] font-mono font-extrabold text-amber-400 mt-1">
                      YELLOW POP 💥
                    </div>
                  </button>

                  {/* Cyber Neon */}
                  <button
                    type="button"
                    onClick={() => handleStyleChange("neon")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      currentConfig.style === "neon"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Cyber Neon</span>
                      {currentConfig.style === "neon" && <Check className="h-3.5 w-3.5 text-pink-400" />}
                    </div>
                    <div className="text-[10px] font-mono font-extrabold text-cyan-400 mt-1">
                      CYAN GLOW ✨
                    </div>
                  </button>

                  {/* Fire Punch */}
                  <button
                    type="button"
                    onClick={() => handleStyleChange("fire")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      currentConfig.style === "fire"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Flame Drop</span>
                      {currentConfig.style === "fire" && <Check className="h-3.5 w-3.5 text-orange-400" />}
                    </div>
                    <div className="text-[10px] font-mono font-extrabold text-orange-500 mt-1">
                      HOT FIRE 🔥
                    </div>
                  </button>

                  {/* Clean Minimal */}
                  <button
                    type="button"
                    onClick={() => handleStyleChange("clean")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      currentConfig.style === "clean"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Clean Pill</span>
                      {currentConfig.style === "clean" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] font-mono font-medium text-slate-300 mt-1">
                      MODERN PILL
                    </div>
                  </button>
                </div>
              </div>

              {/* Subtitle Screen Position (Heading is completely excluded) */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Subtitle Screen Position
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Never placed on top heading to keep video clean
                  </span>
                </div>
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => handlePositionChange("bottom")}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      currentConfig.position !== "center"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Bottom (Safe Zone)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePositionChange("center")}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      currentConfig.position === "center"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Visual Center Hook
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BURNT-IN BRAND LOGO & WATERMARK */}
      {activeTab === "logo" && (
        <div className="space-y-3.5 animate-fade-in text-xs">
          {/* Header & ON/OFF Switch */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span>Burned-In Brand Logo & Watermark</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Baked on MP4
                </span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Burn your channel handle or transparent logo image directly into the exported video
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentLogoConfig.enabled}
                onChange={(e) => handleUpdateLogo({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {currentLogoConfig.enabled && (
            <div className="space-y-3 pt-1 border-t border-slate-200/60">
              {/* Logo Mode: Text vs Image */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Logo Watermark Type
                </span>
                <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateLogo({ type: "text" })}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      currentLogoConfig.type === "text"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Custom Text Handle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLogo({ type: "image" })}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                      currentLogoConfig.type === "image"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>Upload Logo Image</span>
                  </button>
                </div>
              </div>

              {/* Text Input vs Image File Upload */}
              {currentLogoConfig.type === "text" ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Watermark Text / Creator Handle
                  </label>
                  <input
                    type="text"
                    value={currentLogoConfig.text}
                    onChange={(e) => handleUpdateLogo({ text: e.target.value })}
                    placeholder="@YourChannelHandle"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-xs"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Upload Transparent PNG / JPG Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                      <Upload className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Choose Logo File</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoImageUpload}
                        className="hidden"
                      />
                    </label>

                    {currentLogoConfig.imageUrl ? (
                      <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
                        <img
                          src={currentLogoConfig.imageUrl}
                          alt="Logo Preview"
                          className="h-6 w-auto object-contain rounded"
                        />
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Loaded</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">No logo image selected</span>
                    )}
                  </div>
                </div>
              )}

              {/* Corner Position Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Corner Position on 9:16 Video
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "top-right", label: "Top-Right" },
                    { id: "top-left", label: "Top-Left" },
                    { id: "bottom-right", label: "Bottom-Right" },
                    { id: "bottom-left", label: "Bottom-Left" }
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => handleUpdateLogo({ position: pos.id as LogoPosition })}
                      className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                        currentLogoConfig.position === pos.id
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>{pos.label}</span>
                      {currentLogoConfig.position === pos.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity & Size Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">Watermark Opacity</span>
                    <span className="font-mono font-bold text-slate-800">
                      {Math.round((currentLogoConfig.opacity || 0.85) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={currentLogoConfig.opacity || 0.85}
                    onChange={(e) => handleUpdateLogo({ opacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">Watermark Size</span>
                    <span className="font-mono font-bold text-slate-800">
                      {currentLogoConfig.size || 20}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={36}
                    step={2}
                    value={currentLogoConfig.size || 20}
                    onChange={(e) => handleUpdateLogo({ size: parseInt(e.target.value) })}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Apply to All Clips Action */}
              {onApplyLogoToAll && (
                <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                  <span className="text-[11px] text-slate-500">
                    Use same logo across all 5 video clips?
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyLogoAll}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedLogoToast ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-700" />
                        <span>Applied to All 5 Clips!</span>
                      </>
                    ) : (
                      <>
                        <Layers className="h-3 w-3 text-emerald-600" />
                        <span>Apply Logo to All Clips</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
