import { useState, ChangeEvent } from "react";
import {
  Scissors,
  Sparkles,
  Copy,
  Check,
  Flame,
  Instagram,
  Youtube,
  Calendar
} from "lucide-react";
import { VideoClip, AspectRatioType } from "../types";

interface ClipCardProps {
  clip: VideoClip;
  duration: number;
  isSelected: boolean;
  onSelect: () => void;
  onChangeTime: (startTime: number) => void;
  onUpdateCaptions: (captions: any) => void;
  aspectRatio: AspectRatioType;
}

export function ClipCard({
  clip,
  duration,
  isSelected,
  onSelect,
  onChangeTime,
  onUpdateCaptions,
  aspectRatio,
}: ClipCardProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isEditingCaption, setIsEditingCaption] = useState<string | null>(null);

  const colors = [
    "from-red-600 to-rose-500",
    "from-amber-600 to-orange-500",
    "from-emerald-600 to-teal-500",
    "from-cyan-600 to-sky-500",
    "from-violet-600 to-purple-500",
  ];

  const borderColors = [
    "border-red-500/50",
    "border-amber-500/50",
    "border-emerald-500/50",
    "border-cyan-500/50",
    "border-violet-500/50",
  ];

  const ringColors = [
    "ring-red-400",
    "ring-amber-400",
    "ring-emerald-400",
    "ring-cyan-400",
    "ring-violet-400",
  ];

  const glowColors = [
    "shadow-red-500/10",
    "shadow-amber-500/10",
    "shadow-emerald-500/10",
    "shadow-cyan-500/10",
    "shadow-violet-500/10",
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = parseFloat(e.target.value);
    onChangeTime(newStart);
  };

  const currentIdx = clip.clipIndex;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full bg-white relative ${
        isSelected
          ? `border-slate-350 shadow-md ring-2 ${ringColors[currentIdx]} ${glowColors[currentIdx]}`
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Top Banner Indicator */}
      <div className={`p-4 bg-gradient-to-r ${colors[currentIdx]} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 font-mono text-xs font-bold text-white">
            {currentIdx + 1}
          </span>
          <h4 className="font-display font-bold text-sm tracking-wide text-white uppercase">
            {clip.segmentType} Segment
          </h4>
        </div>
        <div className="text-[11px] font-mono text-white/90 bg-black/20 border border-white/10 rounded px-2 py-0.5">
          25.00 Seconds Length
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Timestamp Slider Selector Control */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
              <Scissors className="h-3.5 w-3.5 text-brand-600" />
              <span className="font-bold">Shift 25s Window</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 flex gap-1.5 bg-slate-200/50 px-2.5 py-1 rounded">
              <span className="text-slate-500">Range:</span>
              <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, duration - 25)}
            step={0.1}
            value={clip.startTime}
            onChange={handleSliderChange}
            className="w-full accent-brand-650 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            onClick={(e) => e.stopPropagation()} // Prevents select event triggering again
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2.5 font-medium">
            <span>0:00.00 (Start)</span>
            <span>Drag slider to move window</span>
            <span>{formatTime(Math.max(0, duration - 25))} (Max Start)</span>
          </div>
        </div>

        {/* Framing & Creative Direction Card */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-brand-700 font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Framing / Creative Advice ({aspectRatio})</span>
          </div>
          <p className="text-slate-700 font-medium">
            {clip.creativeIdea || "Fine-tune clip start and end points using the horizontal shifted timeline slider above."}
          </p>
        </div>

        {/* AI Caption Tabs */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-brand-600" />
            <span>Social Captions & Creative Copy (Pre-Formatted)</span>
          </div>

          {/* TikTok tab container */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-red-50 text-red-750 border border-red-200 px-2 py-0.5 rounded font-bold font-mono uppercase flex items-center gap-1">
                <Flame className="h-3 w-3 text-red-500" />
                TikTok Short Content
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(clip.captions.tiktok, "tiktok");
                }}
                className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-200 rounded transition"
                title="Copy Caption"
              >
                {copiedPlatform === "tiktok" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={clip.captions.tiktok}
              onChange={(e) => {
                onUpdateCaptions({ ...clip.captions, tiktok: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-xs text-slate-700 p-2 border border-slate-200 rounded-lg resize-none h-14 focus:ring-1 focus:ring-brand-500 focus:outline-none outline-none"
              placeholder="TikTok Caption"
            />
          </div>

          {/* Instagram tab container */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 px-2 py-0.5 rounded font-bold font-mono uppercase flex items-center gap-1">
                <Instagram className="h-3 w-3 text-fuchsia-500" />
                Instagram Reels
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(clip.captions.instagram, "instagram");
                }}
                className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-200 rounded transition"
                title="Copy Caption"
              >
                {copiedPlatform === "instagram" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={clip.captions.instagram}
              onChange={(e) => {
                onUpdateCaptions({ ...clip.captions, instagram: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-xs text-slate-700 p-2 border border-slate-200 rounded-lg resize-none h-14 focus:ring-1 focus:ring-brand-500 focus:outline-none outline-none"
              placeholder="Instagram Caption"
            />
          </div>

          {/* YouTube Shorts container */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold font-mono uppercase flex items-center gap-1">
                <Youtube className="h-3 w-3 text-red-500" />
                YouTube Shorts
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(clip.captions.youtube, "youtube");
                }}
                className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-200 rounded transition"
                title="Copy Caption"
              >
                {copiedPlatform === "youtube" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <textarea
              value={clip.captions.youtube}
              onChange={(e) => {
                onUpdateCaptions({ ...clip.captions, youtube: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-xs text-slate-700 p-2 border border-slate-200 rounded-lg resize-none h-14 focus:ring-1 focus:ring-brand-500 focus:outline-none outline-none"
              placeholder="YouTube Shorts Caption"
            />
          </div>
        </div>

        {/* Centralised download tip */}
        <div className="pt-3 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 Adjust settings above. Use the main <span className="font-bold text-slate-800">Export Engine</span> button under the video preview to download this clip.
          </p>
        </div>
      </div>
    </div>
  );
}
