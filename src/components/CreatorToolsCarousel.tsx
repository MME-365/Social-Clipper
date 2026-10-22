import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, PlusCircle, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";
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

  // Responsive items per page: 1 for mobile, 2 for tablet, 3 for desktop
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, activeAds.length - itemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Autoplay rotation every 5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, maxIndex]);

  return (
    <section className="space-y-6 pt-4 pb-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Creator Software Ecosystem</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured <span className="text-violet-600">Creator Tools</span> & Partner Apps
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Discover top-tier tools built for digital creators, music producers, and social media media teams.
          </p>
        </div>

        {/* Action Controls & Book Ad Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAdModal}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Advertise Your Tool ($150 / 30 Days)</span>
          </button>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={maxIndex <= 0}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 transition cursor-pointer shadow-2xs"
              aria-label="Previous tools"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={maxIndex <= 0}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 transition cursor-pointer shadow-2xs"
              aria-label="Next tools"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        className="relative overflow-hidden py-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        ref={containerRef}
      >
        <div
          className="flex transition-transform duration-500 ease-out gap-5"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
          }}
        >
          {activeAds.map((ad) => (
            <div
              key={ad.id}
              className="shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] bg-white rounded-2xl border border-slate-200/90 hover:border-violet-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                {/* Brand Logo Display Box */}
                <div className="h-24 w-full bg-slate-950 rounded-xl p-3 flex items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner group-hover:border-violet-500/40 transition">
                  <img
                    src={ad.logoUrl}
                    alt={`${ad.name} logo`}
                    className="max-h-full max-w-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-105"
                  />
                  {ad.badge && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-white border border-white/20">
                      {ad.badge}
                    </div>
                  )}
                </div>

                {/* Card Header & Category */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                      {ad.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Partner</span>
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-violet-700 transition flex items-center gap-1.5 pt-1">
                    <span>{ad.name}</span>
                  </h3>

                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                    {ad.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {ad.description}
                </p>
              </div>

              {/* Card Footer & Outbound Link */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-slate-500">
                  30-Day Spotlight
                </span>

                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs group-hover:shadow-xs"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators / Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? "w-6 bg-violet-600" : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mini Promotion Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-white flex items-center gap-2">
              <span>Have a Creator Tool, Plugin, or SaaS?</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-full uppercase">
                $150 / 30 Days
              </span>
            </div>
            <p className="text-[11px] text-white/80 mt-0.5">
              Advertise your product directly to thousands of high-volume video editors and music creators.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdModal}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>Book Spotlight via PayPal</span>
          <ArrowRight className="h-3.5 w-3.5 text-violet-700" />
        </button>
      </div>
    </section>
  );
}
