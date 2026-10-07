import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Shield,
  Smartphone,
  Flame,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface MarketComparisonProps {
  onOpenPricing?: () => void;
  onOpenStudio?: () => void;
}

export function MarketComparison({ onOpenPricing, onOpenStudio }: MarketComparisonProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "painpoints" | "whattheybetter">("matrix");

  const competitors = [
    {
      name: "SocialClipper SaaS",
      isUs: true,
      price: "$9 / month",
      volume: "35 full videos",
      costPerVideo: "~$0.25",
      batchExport: "Yes (All 5 at once)",
      fullVideo916: "Yes (Full length)",
      directShare: "Yes (TikTok, Reels, Shorts)",
      framingControl: "Custom Pan (Left/Center/Right)",
      creditPenalty: "No (Unlimited retries)",
      highlight: "Best Creator Value"
    },
    {
      name: "Opus Clip",
      isUs: false,
      price: "$19 / month",
      volume: "200 minutes cap",
      costPerVideo: "~$1.20+",
      batchExport: "Limited",
      fullVideo916: "No",
      directShare: "Scheduling only (Paid)",
      framingControl: "Auto-only (Black box)",
      creditPenalty: "Yes (Minutes deducted on fail)",
      highlight: "Expensive minutes"
    },
    {
      name: "GetMunch (Munch)",
      isUs: false,
      price: "$49 / month",
      volume: "200 minutes cap",
      costPerVideo: "~$2.50+",
      batchExport: "Queued",
      fullVideo916: "No",
      directShare: "Requires API auth",
      framingControl: "Auto-only",
      creditPenalty: "Yes (High minute burn)",
      highlight: "Agency pricing"
    },
    {
      name: "Klap.app",
      isUs: false,
      price: "$29 / month",
      volume: "10 videos / month",
      costPerVideo: "~$2.90",
      batchExport: "No",
      fullVideo916: "No",
      directShare: "Basic download",
      framingControl: "Limited",
      creditPenalty: "Yes",
      highlight: "Very low volume"
    },
    {
      name: "CapCut Pro",
      isUs: false,
      price: "$12.99 / month",
      volume: "Manual editor",
      costPerVideo: "Manual labor",
      batchExport: "No (Manual timeline)",
      fullVideo916: "Manual keyframes",
      directShare: "TikTok only",
      framingControl: "Manual keyframing",
      creditPenalty: "N/A",
      highlight: "High editing time"
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-200/60 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
            <span>Market Intelligence & Creator Value Report</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            How We Compare in the AI Video Market
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            An honest, transparent teardown: our pricing edge, what major competitors do better, and how we solve the biggest creator pain points.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "matrix"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Feature & Price Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("whattheybetter")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "whattheybetter"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            What Competitors Do Better
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("painpoints")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "painpoints"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Major Creator Pain Points
          </button>
        </div>
      </div>

      {/* TAB 1: FEATURE & PRICE COMPARISON MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-6 animate-fade-in">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Monthly Volume</th>
                  <th className="py-3.5 px-4">Cost / Video</th>
                  <th className="py-3.5 px-4">Direct Social Share</th>
                  <th className="py-3.5 px-4">Batch 5 Clips</th>
                  <th className="py-3.5 px-4">Framing Control</th>
                  <th className="py-3.5 px-4">Minute Burning?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competitors.map((item, idx) => (
                  <tr
                    key={idx}
                    className={
                      item.isUs
                        ? "bg-violet-50/70 font-semibold text-slate-900 ring-1 ring-inset ring-violet-200"
                        : "hover:bg-slate-50/50 text-slate-600"
                    }
                  >
                    <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                      {item.isUs && (
                        <span className="flex h-2 w-2 rounded-full bg-violet-600"></span>
                      )}
                      <span>{item.name}</span>
                      {item.isUs && (
                        <span className="bg-violet-600 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Our Tool
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.price}
                    </td>
                    <td className="py-3.5 px-4">{item.volume}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {item.costPerVideo}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isUs ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 1-Click Multi
                        </span>
                      ) : (
                        item.directShare
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isUs ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Simultaneous
                        </span>
                      ) : (
                        <span className="text-slate-400">{item.batchExport}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{item.framingControl}</td>
                    <td className="py-3.5 px-4">
                      {item.isUs ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> None (Free retry)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> {item.creditPenalty}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick takeaway summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Unbeatable Pricing Edge</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                At <strong>$9 for 35 videos (~$0.25/video)</strong>, we are <strong>5x to 10x cheaper</strong> than Opus Clip ($19/mo for 200 mins) and Munch ($49/mo). Creators can test dozens of videos without burning their budget.
              </p>
            </div>

            <div className="bg-violet-50/70 border border-violet-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-violet-900">
                <Zap className="h-4 w-4 text-violet-600" />
                <span>Simultaneous Batch 5-Clip Export</span>
              </div>
              <p className="text-xs text-violet-800 leading-relaxed">
                Instead of exporting clips one-by-one and waiting in server queues, creators click <strong>Download All 5</strong> and instantly receive a complete portfolio of vertical clips ready for daily scheduling.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <Smartphone className="h-4 w-4 text-amber-600" />
                <span>Direct Social Share & Publish</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Direct integration with <strong>TikTok, Instagram Reels, and YouTube Shorts</strong> eliminates the file-transfer barrier. 1-click copies optimized captions and opens direct upload portals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHAT ARE THEY DOING BETTER THAN US? */}
      {activeTab === "whattheybetter" && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Honest Engineering Teardown: What Competitors Do Better Today</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              To win this market, we must understand what Opus Clip, Klap, and Munch do better than us today, and build our roadmap around it:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Automated Speaker/Face Tracking */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Competitor Advantage #1
                  </span>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Automated Active-Speaker Face Tracking
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>What they do:</strong> Opus Clip and Klap run neural face detection (YOLO/FaceMesh). When someone talks on the left side of the screen, the 9:16 box automatically pans left; when the co-host talks on the right, it smoothly pans right.
              </p>
              <div className="text-xs text-violet-700 bg-violet-50 p-3 rounded-lg border border-violet-100 font-medium">
                <strong>Our Current vs Future State:</strong> We currently provide precision manual presets (Left, Center, Right) and smooth pan sliders so users don't get stuck with bad AI crops. We can add automatic face tracking via computer vision in our v2 pipeline!
              </div>
            </div>

            {/* 2. Burned-In Dynamic Karaoke Subtitles */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Competitor Advantage #2
                  </span>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Burned-In Dynamic Karaoke Captions
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>What they do:</strong> CapCut and Opus Clip burn animated subtitles (Alex Hormozi style with bouncing words, yellow/green highlights, and emojis) directly into the video pixels using Whisper speech-to-text.
              </p>
              <div className="text-xs text-violet-700 bg-violet-50 p-3 rounded-lg border border-violet-100 font-medium">
                <strong>Our Current vs Future State:</strong> We currently generate tailored platform text captions and hashtags with 1-click clipboard copying. Adding client-side or FFmpeg subtitle burn-in will match their highest visual hook feature.
              </div>
            </div>

            {/* 3. AI Virality Score Metric */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Competitor Advantage #3
                  </span>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Gamified "Virality Score" (e.g. 94/100)
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>What they do:</strong> Opus Clip displays a gamified score ("Virality Score: 92/100 · Strong Hook") next to each clip, telling the creator why this clip is expected to perform well on TikTok.
              </p>
              <div className="text-xs text-violet-700 bg-violet-50 p-3 rounded-lg border border-violet-100 font-medium">
                <strong>Our Edge:</strong> We provide pacing peak detection (Intro, Hook, Beat Drop, Outro) which music creators specifically need, avoiding speech-only bias.
              </div>
            </div>

            {/* 4. Native Cloud Storage Connectors */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Competitor Advantage #4
                  </span>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Google Drive & Dropbox Direct Sync
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>What they do:</strong> Allow podcasters to link shared Google Drive or Zoom folders for hands-off background clipping.
              </p>
              <div className="text-xs text-violet-700 bg-violet-50 p-3 rounded-lg border border-violet-100 font-medium">
                <strong>Our Edge:</strong> Direct YouTube URL input and local high-res MP4/WebM drag-and-drop handles 95% of individual creator workflows without OAuth complexity.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAJOR CREATOR PAIN POINTS & OUR SOLUTION */}
      {activeTab === "painpoints" && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-slate-900">
              The 4 Major Creator Pain Points with Existing Tools
            </h3>
            <p className="text-xs text-slate-500">
              Every video creator encounters these frustrating bottlenecks. Here is why our approach wins their loyalty:
            </p>
          </div>

          <div className="space-y-4">
            {/* Pain Point 1 */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                  1
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  The "Desktop to Phone" Friction & Multi-Platform Posting
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>The Pain:</strong> 85% of short-form videos are uploaded and watched on mobile apps (TikTok, Reels). When a creator renders a video on desktop, they have to AirDrop or email 200MB files to their phone, rewrite captions on a small phone screen, and repeat this 3 times for TikTok, Instagram, and YouTube.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 font-medium">
                <strong>How We Solve It:</strong> Direct 1-Click Social Share Hub with tailored platform captions, deep links to TikTok Creator Center, Instagram Reels, and YouTube Shorts Studio, plus Web Share API and Mobile QR Code Bridge for instant air-drop-free transfer.
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                  2
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Credit Gouging & Paying for Failed Renders
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>The Pain:</strong> On Opus Clip and Munch, you pay $19–$49 for "minutes." If the AI cuts the video awkwardly, crops out the singer's face, or clips the intro silence, you still lose your paid minutes. Creators feel scammed when 40% of their credits are wasted.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 font-medium">
                <strong>How We Solve It:</strong> Clean flat rate ($9/mo for 35 videos, $0.25 each). You can preview, adjust start/end windows, and change framing unlimited times before finalizing the download.
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                  3
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Zero Control Over AI Cropping (Missing the Action)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>The Pain:</strong> Fully automated AI tools guess where the focus is, but in music videos, DJ sets, tutorials, and dance videos, the AI frequently crops out the guitar solo, DJ decks, or side dancers.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 font-medium">
                <strong>How We Solve It:</strong> Custom Pan Offset controls (Left, Center, Right, and fine-tune sliders) directly inside the 9:16 phone preview, giving creators the final say over the composition.
              </div>
            </div>

            {/* Pain Point 4 */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                  4
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Exporting the Whole Video in 9:16
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>The Pain:</strong> Most competitors refuse to reframe the entire original video into 9:16 — they only allow short 30-second clips. If a creator wants to release a full music video on YouTube Shorts or IGTV, they are forced to use Adobe Premiere Pro.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 font-medium">
                <strong>How We Solve It:</strong> Built-in <strong>"Entire Video in 9:16"</strong> button that reframes and exports the complete source video in one click.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to action footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Ready to scale your shorts output without the $49/mo enterprise bloat?
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenStudio && (
            <button
              type="button"
              onClick={onOpenStudio}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              Try Studio Now
            </button>
          )}

          {onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>View $9 Creator Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
