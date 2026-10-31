import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Film, AlertCircle, X, ShieldAlert } from "lucide-react";

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  reason?: string;
  currentVideoTitle?: string;
}

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({
  isOpen,
  onClose,
  onFileUploaded,
  isUploading,
  uploadProgress,
  reason,
  currentVideoTitle
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600/30 border border-violet-500/40 text-violet-400">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Source Video File Needed</h3>
              <p className="text-xs text-slate-400 mt-0.5">Render real 9:16 vertical shorts from your video</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Why is this required?</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {reason || "YouTube security protocols prevent automated cloud servers from scraping this video's high-res stream. Good news: all 5 of your vertical clips, pan offsets, and subtitles are 100% saved!"}
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
