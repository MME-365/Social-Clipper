import React, { useState } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Film,
  Sparkles,
  X,
  Smartphone,
  ShieldCheck
} from "lucide-react";

export interface DownloadModalData {
  url: string;
  blobUrl?: string;
  blob?: Blob;
  filename: string;
  clipTitle: string;
  caption?: string;
}

interface DownloadReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DownloadModalData | null;
}

export function DownloadReadyModal({ isOpen, onClose, data }: DownloadReadyModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;
  const isVideo = data.filename.endsWith(".mp4") || data.filename.endsWith(".webm");

  const handleDownloadAgain = () => {
    const targetUrl = data.blobUrl || data.url;
    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = data.filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
  };

  const handleNativeShare = async () => {
    try {
      if (data.blob && navigator.share) {
        const mime = data.filename.endsWith(".webm") ? "video/webm" : "video/mp4";
        const file = new File([data.blob], data.filename, { type: mime });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: data.clipTitle,
            text: data.caption || "Rendered with SocialClipper 9:16",
            files: [file]
          });
          setShareSuccess("Shared successfully!");
          setTimeout(() => setShareSuccess(null), 3000);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: data.clipTitle,
          text: data.caption || `Check out ${data.clipTitle} exported in 9:16 vertical!`
        });
        setShareSuccess("Link shared!");
        setTimeout(() => setShareSuccess(null), 3000);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.warn("Share failed:", e);
      }
    }
  };

  const handleCopyCaption = () => {
    if (!data.caption) return;
    navigator.clipboard.writeText(data.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header Banner */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-violet-600 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide uppercase">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                Direct Binary Download
              </div>
              <h3 className="text-lg font-bold leading-tight mt-0.5">
                {data.clipTitle || "9:16 Video Ready!"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Video Player Preview if blob available */}
          {isVideo && data.blobUrl && (
            <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center aspect-9/16 max-h-56 mx-auto shadow-inner relative group">
              <video
                src={data.blobUrl}
                controls
                playsInline
                autoPlay
                muted
                loop
                className="h-full w-auto object-contain"
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono pointer-events-none">
                9:16 Vertical
              </div>
            </div>
          )}

          {/* File details card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <Film className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="font-mono text-slate-700 truncate font-semibold">
                {data.filename}
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
              Saved
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* Download Again Button */}
            <button
              type="button"
              onClick={handleDownloadAgain}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white shadow-md shadow-violet-500/25 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              Download {data.filename.endsWith(".webm") ? "WebM Video" : "MP4 Video"}
            </button>

            {/* Mobile Native Share / Save to Gallery */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Save to Photos or Post to TikTok / Reels / Shorts</span>
              </button>
            )}

            {shareSuccess && (
              <div className="text-center text-xs font-semibold text-emerald-600">
                {shareSuccess}
              </div>
            )}
          </div>

          {/* Social Caption Section */}
          {data.caption && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-rose-500" />
                  Social Caption Ready to Paste
                </span>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 cursor-pointer transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap font-sans leading-relaxed line-clamp-4">
                {data.caption}
              </p>
            </div>
          )}

          {/* Direct link in new window fallback (Guarantees bypass of any iframe security) */}
          <div className="text-center pt-1">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 underline decoration-slate-300 transition"
            >
              <span>Open raw video in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Cookie & Iframe Protected • MP4 Direct
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
