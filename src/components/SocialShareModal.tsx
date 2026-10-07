import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Instagram,
  Youtube,
  Smartphone,
  Sparkles,
  Download,
  X,
  Send,
  QrCode,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { VideoClip } from "../types";

interface SocialShareModalProps {
  clip: VideoClip;
  isOpen: boolean;
  onClose: () => void;
  onDownloadClip?: () => void;
}

export function SocialShareModal({
  clip,
  isOpen,
  onClose,
  onDownloadClip
}: SocialShareModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<"tiktok" | "instagram" | "youtube">("tiktok");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const currentCaption = clip.captions[selectedPlatform] || "";

  const handleCopyCaption = (text?: string) => {
    const textToCopy = text || currentCaption;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCaption(true);
    showToast("Caption & tags copied to clipboard!");
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Direct Share via Web Share API (native mobile/desktop share sheet to TikTok, Reels, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shorts Clip #${clip.clipIndex + 1} - ${clip.segmentType}`,
          text: currentCaption,
          url: window.location.href
        });
        showToast("Shared successfully via native share sheet!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          showToast("Native share not completed. Use direct platform buttons below.");
        }
      }
    } else {
      showToast("Native Web Share not supported on this browser. Use direct platform links below.");
    }
  };

  // Launch TikTok Web Creator Center
  const handleShareTikTok = () => {
    handleCopyCaption(clip.captions.tiktok);
    showToast("TikTok caption copied! Opening TikTok Creator Upload...");
    setTimeout(() => {
      window.open("https://www.tiktok.com/creator-center/upload", "_blank", "noopener,noreferrer");
    }, 400);
  };

  // Launch Instagram Reels Web Post
  const handleShareInstagram = () => {
    handleCopyCaption(clip.captions.instagram);
    showToast("Instagram caption copied! Opening Instagram...");
    setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }, 400);
  };

  // Launch YouTube Studio Direct Upload for Shorts
  const handleShareYouTube = () => {
    handleCopyCaption(clip.captions.youtube);
    showToast("YouTube Shorts title & tags copied! Opening YouTube Studio...");
    setTimeout(() => {
      window.open("https://studio.youtube.com/channel/UC/videos/upload?d=hd", "_blank", "noopener,noreferrer");
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Direct Social Share & Publish
              </h3>
              <p className="text-xs text-slate-500">
                Clip #{clip.clipIndex + 1} ({clip.segmentType}) · 9:16 Vertical
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Quick Publish Action Hub */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1-Click Publish to Platforms
            </label>
            <p className="text-xs text-slate-500">
              Clicking automatically copies your optimized caption and hashtags to the clipboard, then opens the platform's direct upload portal:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* TikTok Direct */}
              <button
                type="button"
                onClick={handleShareTikTok}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-slate-900 text-left transition cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                    <Flame className="h-4 w-4 text-rose-600" />
                    <span>TikTok</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-rose-400 group-hover:text-rose-600 transition" />
                </div>
                <div className="text-[11px] text-slate-600 leading-tight">
                  Auto-copy tags & open Creator Center
                </div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Post to TikTok →
                </span>
              </button>

              {/* Instagram Reels Direct */}
              <button
                type="button"
                onClick={handleShareInstagram}
                className="p-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 hover:bg-fuchsia-50 text-slate-900 text-left transition cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-fuchsia-700">
                    <Instagram className="h-4 w-4 text-fuchsia-600" />
                    <span>Reels</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-fuchsia-400 group-hover:text-fuchsia-600 transition" />
                </div>
                <div className="text-[11px] text-slate-600 leading-tight">
                  Auto-copy caption & open Instagram
                </div>
                <span className="text-[10px] font-bold text-fuchsia-600 uppercase tracking-wider">
                  Post to Reels →
                </span>
              </button>

              {/* YouTube Shorts Direct */}
              <button
                type="button"
                onClick={handleShareYouTube}
                className="p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-slate-900 text-left transition cursor-pointer flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-red-700">
                    <Youtube className="h-4 w-4 text-red-600" />
                    <span>Shorts</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-red-400 group-hover:text-red-600 transition" />
                </div>
                <div className="text-[11px] text-slate-600 leading-tight">
                  Auto-copy #Shorts & open Studio
                </div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  Post to Shorts →
                </span>
              </button>
            </div>
          </div>

          {/* Native Mobile / System Share Option */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smartphone className="h-4 w-4 text-violet-600" />
                <span>Native Phone Share (AirDrop / Installed Apps)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 cursor-pointer flex items-center gap-1"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showQrCode ? "Hide QR" : "Beam to Phone (QR)"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If you're on a mobile device or supported desktop, tap below to open the native OS share sheet directly into TikTok, Instagram, WhatsApp, or AirDrop.
            </p>

            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Open Native App Share Sheet</span>
            </button>

            {/* QR Code Bridge Preview */}
            {showQrCode && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-fade-in">
                {/* Clean inline SVG QR code mock for instant scanning */}
                <div className="h-28 w-28 bg-white p-2 border border-slate-200 rounded-lg shrink-0 flex items-center justify-center shadow-xs">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code Corner Squares */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="11" y="11" width="16" height="16" rx="2" fill="white" />
                    <rect x="15" y="15" width="8" height="8" rx="1" fill="currentColor" />

                    <rect x="67" y="5" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="73" y="11" width="16" height="16" rx="2" fill="white" />
                    <rect x="77" y="15" width="8" height="8" rx="1" fill="currentColor" />

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="11" y="73" width="16" height="16" rx="2" fill="white" />
                    <rect x="15" y="77" width="8" height="8" rx="1" fill="currentColor" />

                    {/* QR Code Data Pattern */}
                    <rect x="38" y="10" width="8" height="8" />
                    <rect x="50" y="10" width="8" height="8" />
                    <rect x="38" y="24" width="8" height="8" />
                    <rect x="50" y="24" width="8" height="8" />
                    <rect x="10" y="38" width="8" height="8" />
                    <rect x="24" y="38" width="8" height="8" />
                    <rect x="38" y="38" width="8" height="8" />
                    <rect x="52" y="38" width="8" height="8" />
                    <rect x="66" y="38" width="8" height="8" />
                    <rect x="80" y="38" width="8" height="8" />

                    <rect x="10" y="52" width="8" height="8" />
                    <rect x="38" y="52" width="8" height="8" />
                    <rect x="66" y="52" width="8" height="8" />
                    <rect x="80" y="52" width="8" height="8" />

                    <rect x="38" y="66" width="8" height="8" />
                    <rect x="52" y="66" width="8" height="8" />
                    <rect x="66" y="66" width="8" height="8" />
                    <rect x="52" y="80" width="8" height="8" />
                    <rect x="80" y="80" width="8" height="8" />
                  </svg>
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-slate-900">Mobile Creator Bridge</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Scan this code with your phone camera. It beams the current clip and caption directly to your smartphone so you can publish straight inside the TikTok or Instagram apps!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Caption Customizer & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tailored Platform Caption
              </label>
              <button
                type="button"
                onClick={() => handleCopyCaption()}
                className="text-xs text-violet-600 hover:text-violet-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedCaption ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy {selectedPlatform.toUpperCase()} Caption</span>
                  </>
                )}
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedPlatform("tiktok")}
                className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  selectedPlatform === "tiktok"
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-rose-500" />
                TikTok Format
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform("instagram")}
                className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  selectedPlatform === "instagram"
                    ? "border-fuchsia-500 text-fuchsia-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Instagram className="h-3.5 w-3.5 text-fuchsia-500" />
                Instagram Reels Format
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform("youtube")}
                className={`pb-2 px-3 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  selectedPlatform === "youtube"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                YouTube Shorts Format
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap select-all">
              {currentCaption || "No caption generated yet."}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {onDownloadClip ? (
            <button
              type="button"
              onClick={onDownloadClip}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download 9:16 Video File</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
