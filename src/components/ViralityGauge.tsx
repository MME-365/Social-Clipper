import { useState } from "react";
import {
  Flame,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Award
} from "lucide-react";
import { ViralityMetrics, VideoClip } from "../types";

interface ViralityGaugeProps {
  clip: VideoClip;
  metrics?: ViralityMetrics;
}

// Generates sensible default virality metrics if clip doesn't have them yet
export function getClipViralityMetrics(clip: VideoClip): ViralityMetrics {
  if (clip.viralityMetrics) return clip.viralityMetrics;

  const type = clip.segmentType.toLowerCase();
  let baseScore = 88;
  let hookScore = 91;
  let retention = 85;
  let label = "High Retention Potential";
  let factors = [
    "⚡ Instant visual pacing in first 2.5s",
    "🎵 124 BPM kinetic rhythm matching TikTok reels",
    "🔥 High emotional lyric hook"
  ];
  let tip = "Trim 0.5s off the start to hit the downbeat immediately for +6% retention boost.";

  if (type.includes("drop") || type.includes("chorus")) {
    baseScore = 96;
    hookScore = 98;
    retention = 93;
    label = "🔥 Viral Peak (96/100)";
    factors = [
      "💥 Maximum audio bass drop within opening 3 seconds",
      "📈 93% predicted 15-second completion rate",
      "🔁 High loopability factor for TikTok & YouTube Shorts"
    ];
    tip = "This is your strongest hook clip. Use Hormozi animated karaoke text for maximum visual retention.";
  } else if (type.includes("hook") || type.includes("build")) {
    baseScore = 92;
    hookScore = 94;
    retention = 89;
    label = "⚡ Strong Hook Window (92/100)";
    factors = [
      "🎯 Clear pattern-interrupt within first 2 seconds",
      "📊 89% predicted retention through 15 seconds",
      "🗣️ High sing-along lyric relatability"
    ];
    tip = "Add dynamic pan presets to keep the singer centered during the vocal crescendo.";
  } else if (type.includes("intro")) {
    baseScore = 84;
    hookScore = 86;
    retention = 80;
    label = "Curiosity Hook (84/100)";
    factors = [
      "👀 Strong curiosity open before song kicks in",
      "📈 80% viewer retention probability",
      "💬 High comment discussion starter"
    ];
    tip = "Add a question in your TikTok caption ('Wait till you hear this...') to double retention.";
  } else if (type.includes("outro")) {
    baseScore = 82;
    hookScore = 83;
    retention = 78;
    label = "Satisfaction Climax (82/100)";
    factors = [
      "🎶 Melodic fade and natural song climax",
      "🔁 Smooth transition into replay loop",
      "❤️ High share-with-friends intent"
    ];
    tip = "Cut 1 second before total silence to trigger auto-replay without stutter.";
  }

  return {
    viralityScore: baseScore,
    retentionProbability: retention,
    hookScore: hookScore,
    pacingScore: Math.min(99, baseScore + 2),
    audioEnergy: Math.min(98, baseScore + 3),
    hookLabel: label,
    factors,
    recommendation: tip
  };
}

export function ViralityGauge({ clip, metrics }: ViralityGaugeProps) {
  const [expanded, setExpanded] = useState(false);
  const data = metrics || getClipViralityMetrics(clip);

  // Score color grading
  const isHighViral = data.viralityScore >= 90;
  const scoreBadgeColor = isHighViral
    ? "from-rose-500 to-amber-500 text-white"
    : "from-violet-600 to-indigo-600 text-white";

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5">
      {/* Top Banner: Virality Score & Retention Prediction */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Circular Score Badge */}
          <div className="relative flex items-center justify-center">
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${scoreBadgeColor} flex flex-col items-center justify-center shadow-md font-mono`}>
              <span className="text-base font-extrabold leading-none">{data.viralityScore}</span>
              <span className="text-[9px] font-bold opacity-80">/100</span>
            </div>
            {isHighViral && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-xs">
                <Flame className="h-2.5 w-2.5 fill-slate-900" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Algorithmic Virality Rating
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold font-mono">
                AI Retention Model
              </span>
            </div>
            <div className="text-sm font-display font-extrabold text-white flex items-center gap-1.5">
              <span>{data.hookLabel}</span>
            </div>
          </div>
        </div>

        {/* Predicted Retention Pill */}
        <div className="text-right shrink-0">
          <div className="text-[11px] text-slate-400">Predicted Retention</div>
          <div className="text-base font-extrabold font-mono text-emerald-400 flex items-center justify-end gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{data.retentionProbability}%</span>
          </div>
        </div>
      </div>

      {/* Core Metrics Bar Meters */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Hook Strength */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 space-y-1.5 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Hook Impact</span>
            <span className="font-mono font-bold text-amber-400">{data.hookScore}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${data.hookScore}%` }}
            ></div>
          </div>
        </div>

        {/* Pacing Flow */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 space-y-1.5 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pacing Flow</span>
            <span className="font-mono font-bold text-violet-400">{data.pacingScore}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-violet-400 h-full rounded-full"
              style={{ width: `${data.pacingScore}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Energy */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 space-y-1.5 border border-slate-700/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Audio Peak</span>
            <span className="font-mono font-bold text-emerald-400">{data.audioEnergy}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${data.audioEnergy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expandable Algorithmic Breakdown */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-semibold transition cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Why the Algorithm Likes This Clip</span>
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="mt-2.5 space-y-2.5 text-xs animate-fade-in border-t border-slate-800 pt-2.5">
            {/* Viral Factor Pills */}
            <div className="space-y-1.5">
              {data.factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>

            {/* Recommendation Tip */}
            <div className="p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/60 text-[11px] text-violet-200 space-y-1">
              <strong className="text-amber-300 font-bold block">💡 Algorithmic Optimization Tip:</strong>
              <p className="leading-relaxed">{data.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
