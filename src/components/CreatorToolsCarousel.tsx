import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { CreatorToolAd, DEFAULT_CREATOR_TOOL_ADS } from "../types";

interface CreatorToolsCarouselProps {
  ads?: CreatorToolAd[];
  onOpenAdModal: () => void;
}

export function CreatorToolsCarousel({
  ads = DEFAULT_CREATOR_TOOL_ADS,
  onOpenAdModal
}: CreatorToolsCarouselProps) {
  const activeAds = ads && ads.length > 0 ? ads : DEFAULT_CREATOR_TOOL_ADS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = activeAds.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  };

  // Autoplay rotation: advances 1 brand at a time every 5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, totalSlides]);

  return (
    <section className="space-y-4 pt-4 pb-2 w-full">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Creator Software Ecosystem</span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Featured <span className="text-violet-600">Creator Tools</span> & Partner Apps
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Spotlight showcases of essential tools built for digital creators, audio engineers, and short-form video editors.
        </p>
      </div>

      {/* Full-Length Button: Exact same width/length as the container */}
      <button
        type="button"
        onClick={onOpenAdModal}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-violet-500/30 group"
      >
        <PlusCircle className="h-4 w-4 text-violet-200 group-hover:scale-110 transition-transform" />
        <span>Advertise Your Tool ($150 / 30 Days)</span>
        <ArrowRight className="h-4 w-4 text-violet-200 group-hover:translate-x-1 transition-transform ml-1" />
      </button>

      {/* Single-Brand Spotlight Slide Track (Exactly 1 brand at a time, 0 overlapping) */}
      <div
        className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-sm"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        ref={containerRef}
      >
        <div
          className="flex transition-transform duration-500 ease-out w-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {activeAds.map((ad, idx) => {
            const isSocialClipper =
              ad.id === "ad_socialclipper" ||
              ad.name.toLowerCase().includes("socialclipper") ||
              ad.name.toLowerCase().includes("social clipper");

            const isLweSentry =
              ad.id === "ad_lwe_sentry" ||
              ad.name.toLowerCase().includes("lwe") ||
              ad.name.toLowerCase().includes("sentry");

            return (
              <div
                key={ad.id}
                className="w-full shrink-0 flex-none group p-5 sm:p-7 flex flex-col md:flex-row items-stretch gap-6 lg:gap-8"
              >
                {/* Brand Logo Display Box (White background for SocialClipper, dark for dark-themed partner logos) */}
                <div
                  className={`w-full md:w-80 lg:w-96 min-h-[200px] sm:min-h-[230px] rounded-2xl flex items-center justify-center relative overflow-hidden transition shrink-0 ${
                    isSocialClipper
                      ? "bg-white border-2 border-slate-200/90 shadow-sm group-hover:border-violet-400"
                      : "bg-slate-950 border border-slate-800 shadow-inner group-hover:border-violet-500/40"
                  }`}
                >
                  {/* Subtle dark gradient overlay only for dark partner logos */}
                  {!isSocialClipper && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
                  )}

                  <div className="w-full h-full flex items-center justify-center p-5 relative z-10 overflow-hidden">
                    <img
                      src={ad.logoUrl}
                      alt={`${ad.name} logo`}
                      className={`max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-500 ${
                        isLweSentry
                          ? "translate-x-3 sm:translate-x-4.5"
                          : "translate-x-0.5 sm:translate-x-1"
                      } ${
                        isSocialClipper
                          ? "scale-[1.22] sm:scale-[1.3] group-hover:scale-[1.36]"
                          : "scale-[1.32] sm:scale-[1.42] group-hover:scale-[1.48]"
                      }`}
                    />
                  </div>

                  {ad.badge && (
                    <div
                      className={`absolute top-3 right-3 z-20 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md shadow-xs ${
                        isSocialClipper
                          ? "bg-violet-600 text-white border border-violet-500"
                          : "bg-white/10 backdrop-blur-md text-white border border-white/20"
                      }`}
                    >
                      {ad.badge}
                    </div>
                  )}

                  <div
                    className={`absolute bottom-3 left-3 z-20 text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isSocialClipper
                        ? "text-slate-600 bg-slate-100 border-slate-200"
                        : "text-slate-400 bg-slate-900/80 border-slate-800"
                    }`}
                  >
                    {isSocialClipper ? "Host Platform" : "30-Day Partner Ad"}
                  </div>
                </div>

                {/* Brand Details & Highlights */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                          {ad.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified Partner</span>
                        </span>
                      </div>

                      <div className="text-[11px] font-mono font-medium text-slate-400">
                        Brand Spotlight #{idx + 1} of {totalSlides}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{ad.name}</span>
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-violet-700 mt-1">
                        {ad.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {ad.description}
                    </p>

                    {/* Trust bullet highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>Direct creator workflow integration</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>Featured in SocialClipper partner network</span>
                      </div>
                    </div>
                  </div>

                  {/* Outbound Link & CTA Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono truncate">
                      <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ad.url}</span>
                    </div>

                    <a
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer shrink-0"
                    >
                      <span>Visit {ad.name} Website</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls Bar: Placed BELOW the brands card */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Slide Indicators / Dots */}
        <div className="flex items-center gap-2">
          {activeAds.map((ad, idx) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? "w-8 bg-violet-600 shadow-xs"
                  : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Show ${ad.name} spotlight`}
              title={`Show ${ad.name} (${idx + 1}/${totalSlides})`}
            />
          ))}
          <span className="text-xs font-mono font-bold text-slate-400 ml-1">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        {/* Previous & Next Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrev}
            disabled={totalSlides <= 1}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs disabled:opacity-40 cursor-pointer"
            aria-label="Previous brand"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Brand</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={totalSlides <= 1}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs hover:shadow-md disabled:opacity-40 cursor-pointer"
            aria-label="Next brand"
          >
            <span>Next Brand</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mini Promotion Banner ($150 / 30 Days in One-Time Services) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
              <span>Have a Creator Tool, Plugin, or SaaS?</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                $150 / 30 Days
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">
              Advertise your product directly to thousands of high-volume video editors and music creators.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>Book Spotlight via PayPal</span>
          <ArrowRight className="h-3.5 w-3.5 text-violet-700" />
        </button>
      </div>
    </section>
  );
}
