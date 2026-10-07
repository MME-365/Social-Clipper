import { Clock, Play } from "lucide-react";

interface TimelineVisualizerProps {
  duration: number;
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
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (time / duration) * 100));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-600" />
          <span className="font-semibold text-slate-800 font-display">Full Video Timeline</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <div>
            Playhead: <span className="font-bold text-slate-900">{formatTime(currentTime)}</span>
          </div>
          <span className="text-slate-300">/</span>
          <div>Total: {formatTime(duration)}</div>
        </div>
      </div>

      {/* Main Track Slider & Scrubber */}
      <div className="relative h-12 bg-slate-100 rounded-xl border border-slate-200/70 flex items-center overflow-hidden">
        {/* Clips positioned across the timeline */}
        {clips.map((clip, idx) => {
          const startPct = getPercent(clip.startTime);
          const endPct = getPercent(clip.endTime);
          const widthPct = Math.max(1, endPct - startPct);
          const isActive = idx === activeClipIndex;

          return (
            <button
              key={clip.clipIndex}
              type="button"
              onClick={() => onClipSelect(idx)}
              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
              className={`absolute top-1 bottom-1 rounded-lg border flex flex-col justify-center px-2 cursor-pointer transition-all duration-150 z-10 text-left ${
                isActive
                  ? "bg-violet-600 text-white border-violet-700 shadow-md ring-2 ring-violet-300"
                  : "bg-white/90 hover:bg-white text-slate-700 border-slate-300/80 hover:border-slate-400 shadow-xs"
              }`}
              title={`Clip ${idx + 1}: ${clip.segmentType} (${formatTime(clip.startTime)} - ${formatTime(clip.endTime)})`}
            >
              <div className="text-[11px] font-bold truncate leading-tight">
                Clip {idx + 1}
              </div>
              <span className={`text-[9px] truncate font-medium ${isActive ? "text-violet-100" : "text-slate-500"}`}>
                {clip.segmentType}
              </span>
            </button>
          );
        })}

        {/* Live Scrubber Indicator */}
        <div
          style={{ left: `${getPercent(currentTime)}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-slate-950 z-30 pointer-events-none"
        >
          <div className="absolute -top-1 -ml-1.5 h-3 w-3 rounded-full bg-slate-950 ring-2 ring-white shadow-sm"></div>
        </div>

        {/* Interactive Scrub Surface */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            onScrub(percentage * duration);
          }}
          className="absolute inset-0 cursor-pointer z-20 hover:bg-violet-900/5 transition-colors"
        ></div>
      </div>
    </div>
  );
}
