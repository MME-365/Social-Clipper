import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2, Film, X, ShieldAlert, Key, ExternalLink, RefreshCw } from "lucide-react";

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  reason?: string;
  currentVideoTitle?: string;
  isAdmin?: boolean;
  onYoutubeEngineConnected?: () => void;
}

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({
  isOpen,
  onClose,
  onFileUploaded,
  isUploading,
  uploadProgress,
  reason,
  currentVideoTitle,
  isAdmin = false,
  onYoutubeEngineConnected
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [oauthCode, setOauthCode] = useState<string | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string>("https://www.google.com/device");
  const [startingOAuth, setStartingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!isOpen || !oauthCode) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/saas/admin/youtube-oauth/status");
        const data = await res.json();
        if (data.connected) {
          setOauthCode(null);
          clearInterval(timer);
          if (onYoutubeEngineConnected) onYoutubeEngineConnected();
        }
      } catch {}
    }, 3000);
    return () => clearInterval(timer);
  }, [isOpen, oauthCode, onYoutubeEngineConnected]);

  if (!isOpen) return null;

  const handleStartQuickConnect = async () => {
    setStartingOAuth(true);
    setOauthError(null);
    try {
      const res = await fetch("/api/saas/admin/youtube-oauth/start", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success && data.userCode) {
        setOauthCode(data.userCode);
        setOauthUrl(data.verificationUrl || "https://www.google.com/device");
      } else {
        setOauthError(data.error || "Could not start YouTube authentication.");
      }
    } catch (err: any) {
      setOauthError(err.message || "Network error starting connection.");
    } finally {
      setStartingOAuth(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    await onFileUploaded(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="/brand-logo.png"
              alt="SocialClipper logo"
              className="h-11 w-11 rounded-2xl shrink-0 ring-1 ring-white/20 shadow-sm"
            />
            <div>
              <h3 className="text-lg font-bold font-display text-white">YouTube Stream Access Required</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin
                  ? "Connect the YouTube Cloud Engine once (no uploads needed) or upload MP4"
                  : "Render real 9:16 vertical shorts from your video"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {isAdmin && (
            <div className="bg-linear-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <Key className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-slate-900">
                    Connect Automatic YouTube URL Engine (No File Uploads Needed)
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Authorize YouTube once with a spare/studio Google account in 15 seconds on your phone or browser. Every YouTube URL will download & render in 9:16 automatically.
                  </p>
                </div>
              </div>

              {!oauthCode ? (
                <button
                  type="button"
                  onClick={handleStartQuickConnect}
                  disabled={startingOAuth}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {startingOAuth ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating Activation Code...</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-3.5 w-3.5" />
                      <span>Activate Direct YouTube Engine Now</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white border border-violet-200 rounded-xl p-3 space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-700">
                    Enter this code at <strong className="text-violet-700">google.com/device</strong>:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 bg-slate-900 text-white font-mono text-sm font-bold tracking-widest rounded-lg select-all">
                      {oauthCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(oauthCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedCode ? "Copied!" : "Copy"}
                    </button>
                    <a
                      href={oauthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Waiting for approval... Auto-downloads video once approved.</span>
                  </div>
                </div>
              )}

              {oauthError && (
                <div className="text-[11px] text-rose-600 font-medium">{oauthError}</div>
              )}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Alternative: Manual Video File Upload</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {reason || "If the YouTube Cloud Engine is not connected yet, you can drop an MP4/MOV file here to render immediately — all 5 clips, pan offsets, and subtitles remain saved."}
              </p>
            </div>
          </div>

          {currentVideoTitle && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium px-1">
              <span>Target Project:</span>
              <span className="text-slate-800 font-semibold truncate">{currentVideoTitle}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              dragActive 
                ? "border-violet-500 bg-violet-50/50" 
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/30"
                : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/m4v"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div className="text-sm font-bold text-slate-900">{selectedFile.name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Click to change file
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-10 w-10 text-violet-500" />
                <div className="text-sm font-bold text-slate-800">
                  Drag & drop source video file here
                </div>
                <div className="text-xs text-slate-500">
                  or <span className="text-violet-600 font-semibold underline">browse from your computer</span> (MP4, MOV, WEBM)
                </div>
              </div>
            )}
          </div>

          {/* Progress bar if uploading */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Uploading to rendering engine...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-violet-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedFile || isUploading}
              onClick={handleConfirmUpload}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer ${
                !selectedFile || isUploading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading & Rendering...</span>
                </>
              ) : (
                <span>Upload & Render 9:16 Clip</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
