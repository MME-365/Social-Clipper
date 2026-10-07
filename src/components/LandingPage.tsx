import { Check, Zap, Sparkles, ArrowRight, Shield, Film, Smartphone, Layers, Clock, ExternalLink, Share2, Flame, Instagram, Youtube, TrendingUp } from "lucide-react";
import { PlanConfig, PayPalSettings, SaaSUser } from "../types";
import { MarketComparison } from "./MarketComparison";

interface LandingPageProps {
  plans: {
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  };
  paypalSettings: PayPalSettings;
  currentUser: SaaSUser;
  onSelectPlan: (plan: "free" | "creator" | "enterprise") => void;
  onOpenDashboard: () => void;
}

export function LandingPage({
  plans,
  paypalSettings,
  currentUser,
  onSelectPlan,
  onOpenDashboard
}: LandingPageProps) {
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
            View SaaS Plans & Pricing
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
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
          <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
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
          <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Share2 className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display font-bold text-sm text-slate-900">1-Click Social Sharing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct auto-copy captions and 1-click publishing links for TikTok, Instagram Reels, and YouTube Shorts without phone air-drop hassle.
          </p>
        </div>
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
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Simple, Transparent SaaS Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Choose the right volume for your workflow. Start free, or scale with Creator & Enterprise plans via secure PayPal checkout.
          </p>
        </div>

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

          {/* CREATOR PLAN (MOST POPULAR) */}
          <div className="bg-white border-2 border-violet-600 rounded-2xl p-6 shadow-md shadow-violet-500/10 flex flex-col justify-between space-y-6 relative ring-4 ring-violet-50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider block">
                  {plans.creator.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">${plans.creator.price}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Ideal for music producers, content creators & influencers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs font-semibold text-violet-900">
                <strong>{plans.creator.downloadLimit} video downloads</strong> per month
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
                onClick={() => onSelectPlan("creator")}
                className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Subscribe Creator (${plans.creator.price}/mo)</span>
              </button>

              {paypalSettings.creatorPayPalLink && (
                <a
                  href={paypalSettings.creatorPayPalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 text-center text-[11px] text-violet-600 hover:underline flex items-center justify-center gap-1 font-medium"
                >
                  <span>Checkout directly via PayPal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 relative">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {plans.enterprise.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">${plans.enterprise.price}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  High-capacity volume for marketing agencies & studios.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                <strong>{plans.enterprise.downloadLimit} video downloads</strong> per month
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
                onClick={() => onSelectPlan("enterprise")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Subscribe Enterprise (${plans.enterprise.price}/mo)</span>
              </button>

              {paypalSettings.enterprisePayPalLink && (
                <a
                  href={paypalSettings.enterprisePayPalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 text-center text-[11px] text-slate-600 hover:underline flex items-center justify-center gap-1 font-medium"
                >
                  <span>PayPal Enterprise Checkout</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
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
