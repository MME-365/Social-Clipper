import { Clock, Play, ListCollapse, Volume2 } from "lucide-react";

interface TimelineVisualizerProps {
  duration: number; // total duration in seconds
  clips: Array<{
    clipIndex: number;
    segmentType: string;
    startTime: number;
    endTime: number;
  }>;
  activeClipIndex: number | null;
  onClipSelect: (index: number) => void;
  currentTime: number;
  onScrub: (time: number) => void;
}

export function TimelineVisualizer({
  duration,
  clips,
  activeClipIndex,
  onClipSelect,
  currentTime,
  onScrub,
}: TimelineVisualizerProps) {
  const getPercent = (time: number) => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (time / duration) * 100));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const colors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-violet-500",
  ];

  const lightColors = [
    "hover:bg-red-100/60 border-red-200 text-red-700 bg-red-50/80",
    "hover:bg-amber-100/60 border-amber-200 text-amber-800 bg-amber-50/80",
    "hover:bg-emerald-100/60 border-emerald-200 text-emerald-700 bg-emerald-50/80",
    "hover:bg-cyan-100/60 border-cyan-200 text-cyan-700 bg-cyan-50/80",
    "hover:bg-violet-100/60 border-violet-200 text-violet-750 bg-violet-50/80",
  ];

  const borderColors = [
    "border-red-400",
    "border-amber-400",
    "border-emerald-400",
    "border-cyan-400",
    "border-violet-400",
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-brand-600" />
          <h3 className="font-display font-semibold text-slate-800 text-sm">
            Music Master Timeline
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-md">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span className="text-slate-505">Scrubber:</span>
            <span className="text-slate-900 font-bold">{formatTime(currentTime)}</span>
          </div>
          <div className="text-slate-300">/</div>
          <div className="text-brand-600 font-medium">Total: {formatTime(duration)}</div>
        </div>
      </div>

      {/* Main Track Slider Progress and Scrubber */}
      <div className="relative h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center mb-5 overflow-hidden">
        {/* Render highlight areas representing standard hooks/clips */}
        {clips.map((clip, idx) => {
          const startPct = getPercent(clip.startTime);
          const endPct = getPercent(clip.endTime);
          const widthPct = endPct - startPct;
          const isActive = idx === activeClipIndex;

          return (
            <button
              key={clip.clipIndex}
              onClick={() => onClipSelect(idx)}
              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
              className={`absolute top-1 bottom-1 rounded-lg border flex flex-col justify-center px-1.5 cursor-pointer select-none text-[10px] md:text-xs font-semibold font-mono truncate transition-all duration-200 z-10 ${
                lightColors[idx]
              } ${isActive ? "ring-2 ring-slate-800 scale-[1.01] shadow-md font-bold" : ""}`}
              title={`Clip ${idx + 1}: ${clip.segmentType} (${formatTime(clip.startTime)} - ${formatTime(clip.endTime)})`}
            >
              <div className="flex items-center gap-1 font-sans font-bold">
                <span className={`h-2 w-2 rounded-full ${colors[idx]}`}></span>
                Clip {idx + 1}
              </div>
              <span className="text-[9px] opacity-90 uppercase tracking-wider font-semibold">{clip.segmentType}</span>
            </button>
          );
        })}

        {/* Live Scrubber Indicator bar */}
        <div
          style={{ left: `${getPercent(currentTime)}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-30 pointer-events-none drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]"
        >
          {/* Handle node */}
          <div className="absolute -top-1 -ml-1.5 h-3 w-3 rounded-full bg-slate-900 ring-2 ring-white"></div>
        </div>

        {/* Clickable Background Track to set Scrubber Position */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            onScrub(percentage * duration);
          }}
          className="absolute inset-x-0 inset-y-0 cursor-ew-resize z-0 hover:bg-black/[0.02] transition-colors"
        ></div>
      </div>

      {/* Grid of Clip Indices Selector Quick Buttons */}
      <div className="grid grid-cols-5 gap-2.5">
        {clips.length > 0 ? (
          clips.map((clip, idx) => {
            const isActive = idx === activeClipIndex;
            return (
              <button
                key={clip.clipIndex}
                onClick={() => onClipSelect(idx)}
                className={`flex flex-col items-start p-3 rounded-xl border font-mono transition text-left group ${
                  isActive
                    ? `border-slate-805 bg-slate-50 scale-[1.01] shadow-sm`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-sans mb-1 w-full justify-between">
                  <span className="flex items-center gap-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${colors[idx]}`}></span>
                    Clip {idx + 1}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-500 group-hover:text-slate-600"
                  }`}>
                    {clip.segmentType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                </div>
              </button>
            )
          })
        ) : (
          <div className="col-span-5 text-center text-xs text-slate-400 py-2">
            No active segments found. Enter a YouTube URL or file and start editing.
          </div>
        )}
      </div>
    </div>
  );
}
