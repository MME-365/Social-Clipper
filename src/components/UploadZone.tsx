import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, Film, CheckCircle } from "lucide-react";

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
      alert("Invalid format. Please upload a video file (MP4, WebM, MOV, etc.)");
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

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
          isDragActive
            ? "border-violet-500 bg-violet-50/50"
            : selectedFileName
            ? "border-emerald-300 bg-emerald-50/40"
            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300"
        }`}
      >
        {selectedFileName ? (
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div className="text-left text-xs truncate max-w-[220px]">
              <span className="font-semibold block truncate">{selectedFileName}</span>
              {selectedFileSize && <span className="text-[10px] text-emerald-600">{selectedFileSize}</span>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-slate-600">
            <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-800">Upload video file</p>
              <p className="text-[11px] text-slate-400">MP4, WebM, or MOV</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
