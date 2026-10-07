import { useState } from "react";
import {
  Type,
  Sparkles,
  Flame,
  Zap,
  Sliders,
  Check,
  AlignJustify,
  Layers,
  Palette
} from "lucide-react";
import { VideoClip, KaraokeConfig, KaraokeStyle, KaraokePosition } from "../types";
import { generateDefaultKaraoke } from "../utils/karaokeRenderer";

interface KaraokeStudioProps {
  clip: VideoClip;
  config?: KaraokeConfig;
  onChangeConfig: (newConfig: KaraokeConfig) => void;
}

export function KaraokeStudio({ clip, config, onChangeConfig }: KaraokeStudioProps) {
  // Setup default config if not provided
  const currentConfig: KaraokeConfig = config || {
    enabled: true,
    style: "hormozi",
    position: "bottom",
    fontSize: 28,
    lines: clip.karaokeConfig?.lines || generateDefaultKaraoke(clip)
  };

  const [customText1, setCustomText1] = useState(
    currentConfig.lines[0]?.text || "FEEL THE ENERGY NOW"
  );
  const [customText2, setCustomText2] = useState(
    currentConfig.lines[1]?.text || "WAIT FOR THE DROP"
  );

  const handleToggle = (enabled: boolean) => {
    onChangeConfig({
      ...currentConfig,
      enabled
    });
  };

  const handleStyleChange = (style: KaraokeStyle) => {
    onChangeConfig({
      ...currentConfig,
      style
    });
  };

  const handlePositionChange = (position: KaraokePosition) => {
    onChangeConfig({
      ...currentConfig,
      position
    });
  };

  const handleUpdateLines = (text1: string, text2: string) => {
    setCustomText1(text1);
    setCustomText2(text2);

    const duration = Math.max(1, clip.endTime - clip.startTime);
    const mid = clip.startTime + duration / 2;

    const makeWords = (phrase: string, start: number, end: number) => {
      const raw = phrase.split(/\s+/).filter(Boolean);
      const step = (end - start) / Math.max(1, raw.length);
      return raw.map((w, i) => ({
        word: w,
        startTime: start + i * step,
        endTime: start + (i + 1) * step
      }));
    };

    const newLines = [
      {
        text: text1,
        startTime: clip.startTime,
        endTime: mid,
        words: makeWords(text1, clip.startTime, mid)
      },
      {
        text: text2,
        startTime: mid,
        endTime: clip.endTime,
        words: makeWords(text2, mid, clip.endTime)
      }
    ];

    onChangeConfig({
      ...currentConfig,
      lines: newLines
    });
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-xs">
      {/* Header and Enable Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Type className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>Animated Karaoke Subtitles</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Burn to Video
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Word-by-word bouncing captions baked directly into the 9:16 export
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={currentConfig.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
        </label>
      </div>

      {currentConfig.enabled && (
        <div className="space-y-3.5 pt-1 border-t border-slate-200/60 animate-fade-in text-xs">
          {/* Subtitle Style Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-violet-600" />
              <span>Caption Visual Style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Hormozi Style */}
              <button
                type="button"
                onClick={() => handleStyleChange("hormozi")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentConfig.style === "hormozi"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Hormozi Viral</span>
                  {currentConfig.style === "hormozi" && <Check className="h-3.5 w-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] font-mono font-extrabold text-amber-400 mt-1">
                  BOLD YELLOW 💥
                </div>
              </button>

              {/* Cyberpunk Neon */}
              <button
                type="button"
                onClick={() => handleStyleChange("neon")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentConfig.style === "neon"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Cyber Neon</span>
                  {currentConfig.style === "neon" && <Check className="h-3.5 w-3.5 text-pink-400" />}
                </div>
                <div className="text-[10px] font-mono font-extrabold text-cyan-400 mt-1">
                  CYAN GLOW ✨
                </div>
              </button>

              {/* Fire Punch */}
              <button
                type="button"
                onClick={() => handleStyleChange("fire")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentConfig.style === "fire"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Flame Drop</span>
                  {currentConfig.style === "fire" && <Check className="h-3.5 w-3.5 text-orange-400" />}
                </div>
                <div className="text-[10px] font-mono font-extrabold text-orange-500 mt-1">
                  HOT FIRE 🔥
                </div>
              </button>

              {/* Clean Minimal */}
              <button
                type="button"
                onClick={() => handleStyleChange("clean")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  currentConfig.style === "clean"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-violet-500/30"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Clean Pill</span>
                  {currentConfig.style === "clean" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] font-mono font-medium text-slate-300 mt-1">
                  MODERN WHITE
                </div>
              </button>
            </div>
          </div>

          {/* Subtitle Safe-Zone Position */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Screen Position
            </span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
              {(["bottom", "center", "top"] as KaraokePosition[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handlePositionChange(pos)}
                  className={`px-3 py-1 rounded-md capitalize font-semibold transition cursor-pointer ${
                    currentConfig.position === pos
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {pos === "bottom" ? "Bottom (Safe)" : pos}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Subtitle Lyric Phrases */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Burned Phrase Text (Editable)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Phrase 1 (0–7.5s):</span>
                <input
                  type="text"
                  value={customText1}
                  onChange={(e) => handleUpdateLines(e.target.value, customText2)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold uppercase focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="FIRST HALF PHRASE"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Phrase 2 (7.5–15s):</span>
                <input
                  type="text"
                  value={customText2}
                  onChange={(e) => handleUpdateLines(customText1, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold uppercase focus:ring-1 focus:ring-violet-500 outline-none"
                  placeholder="SECOND HALF PHRASE"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
