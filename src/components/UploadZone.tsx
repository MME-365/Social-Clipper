import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, Music, Film, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFileName?: string;
  selectedFileSize?: string;
}

export function UploadZone({ onFileSelect, selectedFileName, selectedFileSize }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith("video/")) {
      onFileSelect(file);
    } else {
      alert("Invalid format. Please upload a video file (MP4, WebM, etc.)");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formattedSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div id="upload-zone-wrapper" className="w-full">
      <div
        id="uploader-dropzone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 transition-all ${
          isDragActive
            ? "border-brand-500 bg-brand-500/10"
            : selectedFileName
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*"
          onChange={handleChange}
        />

        {selectedFileName ? (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-display font-medium text-white mb-1">
              Music Video Selected!
            </h3>
            <p className="text-sm font-mono text-emerald-400 font-medium mb-3">
              {selectedFileName} {selectedFileSize && `(${selectedFileSize})`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onButtonClick}
                className="text-xs px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
              >
                Choose Another Video
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-800/80 text-brand-400 mb-5 border border-gray-700 shadow-inner group">
              <Upload className="h-7 w-7 text-gray-400 group-hover:text-brand-400 transition-colors" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">
              Upload your Music Video
            </h3>
            <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
              Drag and drop your high-quality music video file here or click to browse.
              Supports MP4, WebM, and master audio containers.
            </p>
            <button
              onClick={onButtonClick}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-md shadow-brand-500/10 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Film className="h-4.5 w-4.5" />
              Browse Media File
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
