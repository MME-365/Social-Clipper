import React from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Smartphone, 
  Film, 
  Download, 
  Mail, 
  ShieldAlert, 
  Zap, 
  Sparkles,
  QrCode,
  Flame,
  Layers,
  XCircle
} from "lucide-react";

interface WorkflowComparisonProps {
  onOpenStudio?: () => void;
  onOpenPricing?: () => void;
}

export function WorkflowComparison({ onOpenStudio, onOpenPricing }: WorkflowComparisonProps) {
  const oldSteps = [
    {
      num: "01",
      title: "Hunt for Shady Downloaders",
      desc: "Browsing ad-filled sites (y2mate, savefrom), dodging fake 'Download' buttons, spam redirects, and malware popups just to get a degraded 720p file.",
      badge: "Spam & Security Risk"
    },
    {
      num: "02",
      title: "CloudConvert / Handbrake Upscaling",
      desc: "Uploading to CloudConvert to restore resolution, hitting free credit limits, and waiting in server queues for a 1080p/4K re-encode.",
      badge: "10-15 Min Wait"
    },
    {
      num: "03",
      title: "Heavy Adobe Premiere Pro ($35+/mo)",
      desc: "Launching desktop NLE, creating 1080×1920 sequences, manually slicing clips, and keyframing pan/crop positions across every scene.",
      badge: "$30-$55/mo Software"
    },
    {
      num: "04",
      title: "Manual Subtitle & Watermark Burn-in",
      desc: "Typing out song lyrics line-by-line, positioning text boxes in the safe zone, and waiting for heavy desktop render queues.",
      badge: "Repetitive Labor"
    },
    {
      num: "05",
      title: "The 'Desktop-to-Phone' Chasm",
      desc: "TikTok and Reels are mobile-native, but Adobe is desktop-only. You're forced to email files to yourself or upload to Google Drive.",
      badge: "Context Switching"
    },
    {
      num: "06",
      title: "Phone Camera Roll & Manual Post",
      desc: "Opening your phone email, saving 5 separate MP4s to your camera roll, and re-typing hashtags and captions from scratch.",
      badge: "Total: 45+ Mins Lost"
    }
  ];

  const newSteps = [
    {
      num: "01",
      title: "1-Click URL Paste or File Drop",
      desc: "Paste any YouTube music video link or drop your source MP4/MOV. Zero spam ads, zero malware popups, full HD/4K audio fidelity.",
      badge: "Clean & Instant"
    },
    {
      num: "02",
      title: "Instant 5-Clip Peak Detection",
      desc: "Automatically maps the 5 highest-engagement musical hooks (Intro, Hook, Build, Beat Drop, Outro) with draggable time-scrubbing.",
      badge: "Automated Hooks"
    },
    {
      num: "03",
      title: "1-Click 9:16 Vertical Pan Framing",
      desc: "Left, Center, and Right framing presets keep performers centered in the 9:16 mobile frame with an interactive phone mockup preview.",
      badge: "Zero Adobe Required"
    },
    {
      num: "04",
      title: "Animated Karaoke Lyrics & Watermarks",
      desc: "Bake Hormozi or Neon subtitles and your channel brand logo directly into the video canvas and MP4 export in one click.",
      badge: "Viral Styling"
    },
    {
      num: "05",
      title: "Batch 5-Clip High-Speed 4K Render",
      desc: "Render all 5 vertical clips simultaneously using server-side FFmpeg pipelines without freezing your computer.",
      badge: "Batch Export"
    },
    {
      num: "06",
      title: "Scan QR Code Directly to Phone",
      desc: "Scan the on-screen QR code with your phone camera—your clip saves directly to your mobile camera roll ready to post on TikTok & Reels.",
      badge: "Total: 90 Seconds"
    }
  ];

  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          <span>The Real Creator Struggle Solved</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The 6-Step Creator Nightmare vs. <span className="text-violet-600">The SocialClipper Way</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Creators don't burn out from making content—they burn out from acting like human file-transfer machines between sketchy download sites, CloudConvert, Adobe Premiere, and emailing files to their phones.
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* The Old Way (Red/Slate card) */}
        <div className="bg-slate-50/80 border border-rose-200/80 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">The Exhausting Old Flow</h3>
                  <p className="text-[11px] text-slate-500">5 apps • 45+ minutes per video • constant friction</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                45+ Mins Lost
              </span>
            </div>

            <div className="space-y-3.5 pt-4">
              {oldSteps.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-200/70 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs">
                  <span className="font-mono text-xs font-bold text-slate-400 mt-0.5 shrink-0">
                    {step.num}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <span className="text-[10px] font-medium bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 shrink-0">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold text-rose-950">Result: Heavy editing fatigue, posting once a week</span>
            <span className="text-slate-400 font-mono text-[11px]">Cost: $45-$80/mo</span>
          </div>
        </div>

        {/* The SocialClipper Way (Violet/Emerald card) */}
        <div className="bg-violet-50/40 border-2 border-violet-500/60 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-md shadow-violet-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-violet-600 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-1 rounded-bl-xl shadow-xs">
            Built for Modern Creators
          </div>

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-violet-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">The SocialClipper Flow</h3>
                  <p className="text-[11px] text-violet-700 font-medium">1 URL • 5 ready-to-post vertical clips • 90 seconds</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                ⚡ 90 Seconds
              </span>
            </div>

            <div className="space-y-3.5 pt-4">
              {newSteps.map((step, idx) => (
                <div key={idx} className="bg-white border border-violet-200/70 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:border-violet-400 transition">
                  <span className="font-mono text-xs font-bold text-violet-600 mt-0.5 shrink-0">
                    {step.num}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-violet-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-900">
              Result: Post 3-5 viral shorts a day with zero friction
            </div>
            {onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Try It in Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Big Impact Numbers Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-display">90 Sec</div>
          <div className="text-xs text-slate-400 font-medium">From Link to 5 Clips</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">0 Apps</div>
          <div className="text-xs text-slate-400 font-medium">To Install on Desktop</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">1-Scan</div>
          <div className="text-xs text-slate-400 font-medium">Mobile QR Download</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-display">100%</div>
          <div className="text-xs text-slate-400 font-medium">Spam-Free HD Streams</div>
        </div>
      </div>
    </section>
  );
}
