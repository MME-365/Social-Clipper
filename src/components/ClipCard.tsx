import { useState, ChangeEvent } from "react";
import {
  Scissors,
  Copy,
  Check,
  Flame,
  Instagram,
  Youtube,
  Clock,
  Sparkles,
  Download,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Film,
  Share2,
  ExternalLink,
  Send,
  QrCode
} from "lucide-react";
import { VideoClip, AspectRatioType, KaraokeConfig } from "../types";
import { SocialShareModal } from "./SocialShareModal";
import { ViralityGauge } from "./ViralityGauge";
import { KaraokeStudio } from "./KaraokeStudio";

interface ClipCardProps {
  clip: VideoClip;
  duration: number;
  isSelected: boolean;
  onSelect: () => void;
  onChangeTime: (startTime: number) => void;
  onUpdateCaptions: (captions: any) => void;
  aspectRatio: AspectRatioType;
  panOffset: number;
  onChangePanOffset: (pan: number) => void;
  zoomLevel: number;
  onChangeZoomLevel: (zoom: number) => void;
  onExportClip: (clipIndex: number) => void;
  onExportAllClips: () => void;
  onExportFullVideo: () => void;
  exportingMode: "none" | "single" | "all" | "full";
  exportProgress: number;
  batchProgress: { current: number; total: number; progress: number } | null;
  onUpdateKaraoke?: (config: KaraokeConfig) => void;
}

export function ClipCard({
  clip,
  duration,
  isSelected,
  onSelect,
  onChangeTime,
  onUpdateCaptions,
  aspectRatio,
  panOffset,
  onChangePanOffset,
  zoomLevel,
  onChangeZoomLevel,
  onExportClip,
  onExportAllClips,
  onExportFullVideo,
  exportingMode = "none",
  exportProgress = 0,
  batchProgress = null,
  onUpdateKaraoke
}: ClipCardProps) {
  const [activeTab, setActiveTab] = useState<"tiktok" | "instagram" | "youtube">("tiktok");
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  const handleCopy = () => {
    const text = clip.captions[activeTab] || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = parseFloat(e.target.value);
    onChangeTime(newStart);
  };

  const clipDuration = Number((clip.endTime - clip.startTime).toFixed(1));

  const nudge = (seconds: number) => {
    const maxStart = Math.max(0, duration - clipDuration);
    const newStart = Math.min(maxStart, Math.max(0, clip.startTime + seconds));
    onChangeTime(newStart);
  };

  const isBusy = exportingMode !== "none";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white font-mono text-xs font-bold shadow-sm">
            {clip.clipIndex + 1}
          </span>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 capitalize">
              {clip.segmentType}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatTime(clip.startTime)} – {formatTime(clip.endTime)} ({clipDuration}s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-100">
          <Clock className="h-3.5 w-3.5" />
          <span>{clipDuration}s Window</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Step 1: Algorithmic Virality Score & Retention Prediction */}
        <ViralityGauge clip={clip} metrics={clip.viralityMetrics} />

        {/* Clip Timing Adjuster */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-violet-600" />
              Clip Position in Full Video
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
              <span>{formatTime(clip.startTime)}</span>
              <span className="text-slate-400">→</span>
              <span>{formatTime(clip.endTime)}</span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, duration - clipDuration)}
            step={0.1}
            value={clip.startTime}
            onChange={handleSliderChange}
            className="w-full accent-violet-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>0:00</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nudge(-5)}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold transition cursor-pointer"
                title="Shift 5s backward"
              >
                -5s
              </button>
              <button
                type="button"
                onClick={() => nudge(5)}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold transition cursor-pointer"
                title="Shift 5s forward"
              >
                +5s
              </button>
            </div>
            <span>{formatTime(Math.max(0, duration - clipDuration))}</span>
          </div>
        </div>

        {/* 9:16 Resized Frame Adjustment (Pan Framing) */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-violet-600" />
              Adjust 9:16 Resized Frame (Pan Offset)
            </span>
            <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60">
              {panOffset === 0 ? "Centered (0%)" : panOffset < 0 ? `Left (${Math.abs(panOffset)}%)` : `Right (+${panOffset}%)`}
            </span>
          </div>

          {/* Quick Framing Presets */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onChangePanOffset(-25)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                panOffset <= -15
                  ? "bg-violet-600 text-white border-violet-700 shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              Pan Left
            </button>
            <button
              type="button"
              onClick={() => onChangePanOffset(0)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                panOffset > -15 && panOffset < 15
                  ? "bg-violet-600 text-white border-violet-700 shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <AlignCenter className="h-3.5 w-3.5" />
              Center
            </button>
            <button
              type="button"
              onClick={() => onChangePanOffset(25)}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition cursor-pointer ${
                panOffset >= 15
                  ? "bg-violet-600 text-white border-violet-700 shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <AlignRight className="h-3.5 w-3.5" />
              Pan Right
            </button>
          </div>

          {/* Pan Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>← Focus Left</span>
              <span className="font-medium text-slate-400">Position 9:16 frame</span>
              <span>Focus Right →</span>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              step={1}
              value={panOffset}
              onChange={(e) => onChangePanOffset(parseInt(e.target.value))}
              className="w-full accent-violet-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Step 3: Animated Karaoke Subtitles Studio */}
        <KaraokeStudio
          clip={clip}
          config={clip.karaokeConfig}
          onChangeConfig={(cfg) => onUpdateKaraoke && onUpdateKaraoke(cfg)}
        />

        {/* Clean Tabbed Social Captions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Social Captions</label>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-violet-600 hover:text-violet-700 font-semibold inline-flex items-center gap-1 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Caption</span>
                </>
              )}
            </button>
          </div>

          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("tiktok")}
              className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "tiktok"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              TikTok
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("instagram")}
              className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "instagram"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Instagram className="h-3.5 w-3.5 text-fuchsia-500" />
              Instagram
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("youtube")}
              className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "youtube"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Youtube className="h-3.5 w-3.5 text-red-500" />
              Shorts
            </button>
          </div>

          <textarea
            value={clip.captions[activeTab] || ""}
            onChange={(e) => {
              onUpdateCaptions({ ...clip.captions, [activeTab]: e.target.value });
            }}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white transition"
            placeholder={`Enter ${activeTab} caption...`}
          />
        </div>

        {/* 9:16 DOWNLOAD HUB (Individual Clip, All 5 Clips Batch, or Entire Video) */}
        <div className="pt-2 border-t border-slate-200/80 space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-violet-600" />
            9:16 Download Options
          </label>

          {/* Progress Banner if Busy */}
          {isBusy && (
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-violet-900">
                <span className="flex items-center gap-1.5">
                  <div className="h-3 w-3 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                  {exportingMode === "single" && `Exporting Clip #${clip.clipIndex + 1} (${exportProgress}%)...`}
                  {exportingMode === "all" && batchProgress && `Exporting Clip ${batchProgress.current} of ${batchProgress.total} (${batchProgress.progress}%)...`}
                  {exportingMode === "full" && `Exporting Full 9:16 Video (${exportProgress}%)...`}
                </span>
                <span className="font-mono">{exportingMode === "all" && batchProgress ? `${batchProgress.progress}%` : `${exportProgress}%`}</span>
              </div>
              <div className="w-full bg-violet-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-violet-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${exportingMode === "all" && batchProgress ? batchProgress.progress : exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Option 1: Download Selected Clip */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onExportClip(clip.clipIndex)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              isBusy
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white shadow-violet-500/20"
            }`}
          >
            <Download className="h-4 w-4" />
            Download Clip #{clip.clipIndex + 1} in 9:16
          </button>

          {/* Options 2 & 3: Batch All 5 Clips OR Full Video in 9:16 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Download All 5 at once */}
            <button
              type="button"
              disabled={isBusy}
              onClick={onExportAllClips}
              className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                isBusy
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
              title="Render and download all 5 clips simultaneously in 9:16"
            >
              <Layers className="h-3.5 w-3.5 text-violet-600" />
              Download All 5 Clips
            </button>

            {/* Download Entire Video in 9:16 */}
            <button
              type="button"
              disabled={isBusy}
              onClick={onExportFullVideo}
              className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                isBusy
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
              title="Render the entire video from 0:00 to end cropped into 9:16 format"
            >
              <Film className="h-3.5 w-3.5 text-violet-600" />
              Entire Video in 9:16
            </button>
          </div>

          {/* 1-CLICK SOCIAL SHARE & PUBLISH HUB */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-rose-500" />
                Share & Publish to Socials
              </label>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="text-[11px] font-bold text-violet-600 hover:text-violet-700 cursor-pointer flex items-center gap-1"
              >
                <span>Full Share Hub</span>
                <Send className="h-3 w-3" />
              </button>
            </div>

            {/* Quick 1-click platform triggers */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(clip.captions.tiktok);
                  setShareToast("TikTok caption copied! Opening TikTok...");
                  setTimeout(() => setShareToast(null), 3000);
                  window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
                }}
                className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-800 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Copy TikTok caption & open TikTok Creator Upload"
              >
                <Flame className="h-3.5 w-3.5 text-rose-600" />
                <span>TikTok</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(clip.captions.instagram);
                  setShareToast("Instagram caption copied! Opening Instagram...");
                  setTimeout(() => setShareToast(null), 3000);
                  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
                }}
                className="py-1.5 px-2 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100/80 border border-fuchsia-200/80 text-fuchsia-800 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Copy Instagram caption & open Instagram"
              >
                <Instagram className="h-3.5 w-3.5 text-fuchsia-600" />
                <span>Reels</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(clip.captions.youtube);
                  setShareToast("Shorts title copied! Opening YouTube Studio...");
                  setTimeout(() => setShareToast(null), 3000);
                  window.open("https://studio.youtube.com/channel/UC/videos/upload?d=hd", "_blank", "noopener,noreferrer");
                }}
                className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100/80 border border-red-200/80 text-red-800 font-semibold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                title="Copy YouTube Shorts title & open YouTube Studio"
              >
                <Youtube className="h-3.5 w-3.5 text-red-600" />
                <span>Shorts</span>
              </button>
            </div>

            {shareToast && (
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center animate-fade-in">
                ✓ {shareToast}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Share & Mobile Bridge Modal */}
      <SocialShareModal
        clip={clip}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDownloadClip={() => onExportClip(clip.clipIndex)}
      />
    </div>
  );
}
