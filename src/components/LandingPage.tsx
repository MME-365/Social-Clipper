import { useState } from "react";
import { Check, Zap, Sparkles, ArrowRight, Shield, Film, Smartphone, Layers, Clock, ExternalLink, Share2, Flame, Instagram, Youtube, TrendingUp, Tag, Award } from "lucide-react";
import { PlanConfig, PayPalSettings, SaaSUser, OneTimePack, DEFAULT_ONE_TIME_PACKS, CreatorToolAd } from "../types";
import { MarketComparison } from "./MarketComparison";
import { CreatorToolsCarousel } from "./CreatorToolsCarousel";

interface LandingPageProps {
  plans: {
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  };
  paypalSettings: PayPalSettings;
  currentUser: SaaSUser;
  oneTimePacks?: OneTimePack[];
  creatorAds?: CreatorToolAd[];
  onSelectPlan: (plan: "free" | "creator" | "enterprise", billingCycle?: "monthly" | "annual") => void;
  onSelectPack?: (packId: "pack_5" | "pack_25" | "pack_50") => void;
  onOpenDashboard: () => void;
  onOpenAdModal?: () => void;
}

export function LandingPage({
  plans,
  paypalSettings,
  currentUser,
  oneTimePacks,
  creatorAds,
  onSelectPlan,
  onSelectPack,
  onOpenDashboard,
  onOpenAdModal
}: LandingPageProps) {
  const [pricingMode, setPricingMode] = useState<"monthly" | "annual" | "onetime">("monthly");
  const activePacks = oneTimePacks && oneTimePacks.length > 0 ? oneTimePacks : DEFAULT_ONE_TIME_PACKS;
  return (
    <div className="space-y-16 pb-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-5 px-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200/80 px-3 py-1 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-violet-600" />
          <span>The #1 YouTube & Video to 9:16 Shorts Automation Platform</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Long Videos Into <span className="text-violet-600">Viral 9:16 Shorts</span> in Seconds
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Paste any YouTube music video or upload a file. Auto-detect pacing peaks, adjust 9:16 vertical crop framing, generate viral social captions, and download in 4K.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md shadow-violet-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Access User Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm transition text-center"
          >
            View Plans & Pricing
          </a>
          <a
            href="#comparison"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-semibold text-sm transition text-center flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Market Comparison</span>
          </a>
        </div>

        {/* Quiet social proof */}
        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>⚡ Instant 9:16 Resizing</span>
          <span aria-hidden="true">·</span>
          <span>🎵 Full Audio & 4K Quality</span>
          <span aria-hidden="true">·</span>
          <span>📱 TikTok, Reels & Shorts 1-Click Share</span>
        </div>
      </section>

      {/* Feature Value Pillars */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">Burnt-In Logos & Custom Subtitles</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bake your channel logo, handle watermark, and single-phrase animated captions with custom lyric editing directly into the 9:16 video canvas and MP4 export.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Flame className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">Algorithmic Virality Score</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Predicts retention probability %, analyzes 15-second drop completion rate, and provides tactical recommendations to maximize engagement.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">Custom 9:16 Pan Framing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Widescreen videos are cropped to 9:16. Adjust horizontal framing presets (Left, Center, Right) so your subject stays in view.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">5 Pacing Peak Clips</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Auto-map 5 key song moments (Intro, Hook, Build, Beat Drop, Outro). Fine-tune start/end windows with smooth scrubber.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">Batch Multi-Clip Export</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Download all 5 clips simultaneously, or render the entire video in full 9:16 format with high-speed processing.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Share2 className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">1-Click Social Sharing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct auto-copy captions and 1-click publishing links for TikTok, Instagram Reels, and YouTube Shorts without phone air-drop hassle.
          </p>
        </div>
      </section>

      {/* FEATURED CREATOR TOOLS CAROUSEL (ABOVE MARKET INTELLIGENCE) */}
      <section className="max-w-5xl mx-auto px-4">
        <CreatorToolsCarousel
          ads={creatorAds}
          onOpenAdModal={onOpenAdModal || onOpenDashboard}
        />
      </section>

      {/* MARKET COMPARISON & CREATOR VALUE SECTION */}
      <section id="comparison" className="max-w-5xl mx-auto px-4 scroll-mt-20">
        <MarketComparison
          onOpenPricing={() => {
            const el = document.getElementById("pricing");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onOpenStudio={onOpenDashboard}
        />
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 space-y-8 scroll-mt-20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
            <Tag className="h-3.5 w-3.5 text-violet-600" />
            <span>Flexible Creator Billing</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Choose how you want to create. Subscribe monthly, save 20% with annual billing, or grab one-time lifetime credit packs without recurring fees.
          </p>

          {/* Pricing Mode Toggle Switch */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => setPricingMode("monthly")}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setPricingMode("annual")}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === "annual"
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual
              </button>

              <button
                type="button"
                onClick={() => setPricingMode("onetime")}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === "onetime"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                One Time
              </button>
            </div>
          </div>
        </div>

        {/* PRICING GRIDS */}
        {pricingMode === "onetime" ? (
          /* ONE-TIME CREDIT PACKS ($5 for 12, $25 for 65, $50 for 135) */
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-block text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
                ⚡ Pay Once • Lifetime Video Credits • Never Expire • No Monthly Charge
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {activePacks.map((pack) => {
                const isPopular = pack.popular;
                return (
                  <div
                    key={pack.id}
                    className={`bg-white rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all duration-200 ${
                      isPopular
                        ? "border-2 border-violet-600 shadow-lg shadow-violet-500/10 ring-4 ring-violet-50"
                        : "border border-slate-200/90 shadow-xs hover:border-slate-300"
                    }`}
                  >
                    {pack.badge && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                        isPopular ? "bg-violet-600" : "bg-slate-800"
                      }`}>
                        {pack.badge}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                          {pack.name}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-extrabold text-slate-900">${pack.price}</span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {pack.pricePerVideo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 pt-1">
                          One-time payment. Add video download credits directly to your account.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-violet-50/80 border border-violet-100 space-y-1">
                        <div className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-violet-600 shrink-0" />
                          <span>{pack.videoCredits} Video Downloads Included</span>
                        </div>
                        <div className="text-[11px] text-violet-700 font-medium">
                          Bypass weekly limits instantly • Credits never expire
                        </div>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                        {pack.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectPack) {
                            onSelectPack(pack.id);
                          } else {
                            onOpenDashboard();
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                          isPopular
                            ? "bg-violet-600 hover:bg-violet-700 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5" />
                        <span>Order {pack.videoCredits} Videos (${pack.price})</span>
                      </button>

                      <div className="text-[11px] text-center text-slate-400 font-medium">
                        Instant credit activation via PayPal
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CREATOR TOOL ADS IN ONE-TIME SERVICES ($150 / 30 DAYS CYCLE) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>One-Time Service • 30 Days Cycle</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    Creator Tool Ad Spotlight
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Advertise your software, plugin, or creator service in our prominent partner carousel above Market Intelligence. Users click directly through to your website.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Carousel placement above Market Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Upload your brand logo & target URL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Full 30-day active rotation cycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Pay once via PayPal (no recurring billing)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col justify-between space-y-4 shrink-0 sm:min-w-[260px]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                      One-Time Service
                    </span>
                    <div className="flex items-baseline justify-center gap-1 mt-1">
                      <span className="text-4xl font-black text-white">$150</span>
                      <span className="text-xs text-slate-300 font-medium">/ 30 days</span>
                    </div>
                    <span className="text-[10px] text-slate-300 block mt-1">
                      Instant activation via PayPal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAdModal || onOpenDashboard}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Book Tool Ad ($150)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SUBSCRIPTION PLANS (MONTHLY VS ANNUAL 20% DISCOUNT) */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* FREE PLAN */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    {plans.free.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">$0</span>
                    <span className="text-xs text-slate-500">/ week</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    Perfect for trying the 9:16 clipper workflow.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                  <strong>{plans.free.downloadLimit} download</strong> allowed per week
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                  {plans.free.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPlan("free");
                  onOpenDashboard();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition cursor-pointer"
              >
                {currentUser.tier === "free" ? "Current Active Plan" : "Continue with Free"}
              </button>
            </div>

            {/* CREATOR PLAN */}
            {(() => {
              const isAnnual = pricingMode === "annual";
              const creatorAnnualPrice = 86; // $9 * 12 = $108 -> 20% off = $86/yr
              const creatorMonthlyEquiv = "7.20";

              return (
                <div className="bg-white border-2 border-violet-600 rounded-2xl p-6 shadow-md shadow-violet-500/10 flex flex-col justify-between space-y-6 relative ring-4 ring-violet-50">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[11px] sm:text-xs font-extrabold px-6 sm:px-8 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap min-w-[210px] sm:min-w-[230px] border border-violet-400/30">
                    <span>Most Popular</span>
                    {isAnnual && <span className="text-violet-200 font-black">• 20% OFF</span>}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider block">
                        {plans.creator.name} {isAnnual ? "(Annual)" : ""}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ${isAnnual ? creatorAnnualPrice : plans.creator.price}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isAnnual ? "/ year" : "/ month"}
                        </span>
                        {isAnnual && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ${creatorMonthlyEquiv}/mo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 pt-1">
                        {isAnnual
                          ? "Billed annually at $86/yr (Saves $22 compared to monthly)."
                          : "Ideal for music producers, content creators & influencers."}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs font-semibold text-violet-900">
                      <strong>{plans.creator.downloadLimit} video downloads</strong> per month ({isAnnual ? "420/year" : "35/mo"})
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                      {plans.creator.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlan("creator", isAnnual ? "annual" : "monthly")}
                      className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {isAnnual
                          ? `Subscribe Annual ($${creatorAnnualPrice}/yr)`
                          : `Subscribe Creator ($${plans.creator.price}/mo)`}
                      </span>
                    </button>

                    {(() => {
                      const creatorLink = isAnnual
                        ? (paypalSettings.creatorAnnualPayPalLink || paypalSettings.creatorPayPalLink)
                        : (paypalSettings.creatorMonthlyPayPalLink || paypalSettings.creatorPayPalLink);

                      return creatorLink ? (
                        <a
                          href={creatorLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 text-center text-[11px] text-violet-600 hover:underline flex items-center justify-center gap-1 font-medium"
                        >
                          <span>Checkout {isAnnual ? "Annual" : "Monthly"} via PayPal</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* ENTERPRISE PLAN */}
            {(() => {
              const isAnnual = pricingMode === "annual";
              const enterpriseAnnualPrice = 950; // $99 * 12 = $1,188 -> 20% off = $950/yr (~$79/mo)
              const enterpriseMonthlyEquiv = "79";

              return (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 relative">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {plans.enterprise.name} {isAnnual ? "(Annual)" : ""}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ${isAnnual ? enterpriseAnnualPrice : plans.enterprise.price}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isAnnual ? "/ year" : "/ month"}
                        </span>
                        {isAnnual && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ${enterpriseMonthlyEquiv}/mo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 pt-1">
                        {isAnnual
                          ? "Billed annually at $950/yr (Saves $238 with 20% discount)."
                          : "High-capacity volume for marketing agencies & studios."}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                      <strong>{plans.enterprise.downloadLimit} video downloads</strong> per month ({isAnnual ? "4,800/year" : "400/mo"})
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                      {plans.enterprise.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlan("enterprise", isAnnual ? "annual" : "monthly")}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {isAnnual
                          ? `Subscribe Annual ($${enterpriseAnnualPrice}/yr)`
                          : `Subscribe Enterprise ($${plans.enterprise.price}/mo)`}
                      </span>
                    </button>

                    {(() => {
                      const enterpriseLink = isAnnual
                        ? (paypalSettings.enterpriseAnnualPayPalLink || paypalSettings.enterprisePayPalLink)
                        : (paypalSettings.enterpriseMonthlyPayPalLink || paypalSettings.enterprisePayPalLink);

                      return enterpriseLink ? (
                        <a
                          href={enterpriseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 text-center text-[11px] text-slate-600 hover:underline flex items-center justify-center gap-1 font-medium"
                        >
                          <span>Checkout {isAnnual ? "Annual" : "Monthly"} via PayPal</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-5">
        <h3 className="font-display font-bold text-xl text-slate-900 text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 text-xs">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-slate-800">How does the Free Tier download limit work?</h4>
            <p className="text-slate-600 leading-relaxed">
              Free users can download 1 video clip per week. Batch downloading all 5 clips simultaneously is reserved for paid tiers (Creator and Enterprise).
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-slate-800">What happens when I reach my monthly limit?</h4>
            <p className="text-slate-600 leading-relaxed">
              Your account tracks monthly video exports. Once you reach 35 downloads (Creator) or 400 downloads (Enterprise), the system pauses new exports until your monthly billing cycle resets, or you can upgrade to Enterprise anytime.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-slate-800">How does the 20% Annual Discount work?</h4>
            <p className="text-slate-600 leading-relaxed">
              When you select Annual Billing, you get 12 full months for the price of under 10 months (a full 20% discount). Creator drops from $108/yr to $86/yr ($7.20/month equivalent), and Enterprise drops from $1,188/yr to $950/yr ($79/month equivalent).
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-slate-800">Do One-Time Credit Packs ($5, $25, $50) expire?</h4>
            <p className="text-slate-600 leading-relaxed">
              No! One-time orders have zero subscription and zero expiration. You receive 12 video credits ($5), 65 video credits ($25), or 135 video credits ($50) directly added to your balance to use whenever you want.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1">
            <h4 className="font-bold text-slate-800">How do PayPal payments work?</h4>
            <p className="text-slate-600 leading-relaxed">
              Payments are handled securely through PayPal payment links and webhooks. Once completed, your account is immediately upgraded with your full quota unlocked.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
