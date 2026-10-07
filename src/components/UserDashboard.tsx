import { useState, FormEvent } from "react";
import { User, Shield, Zap, Clock, Check, AlertCircle, ArrowUpRight, RefreshCw, Film, ExternalLink, LogIn, TrendingUp } from "lucide-react";
import { SaaSUser, PlanConfig, PayPalSettings } from "../types";
import { MarketComparison } from "./MarketComparison";

interface UserDashboardProps {
  user: SaaSUser;
  plans: {
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  };
  paypalSettings: PayPalSettings;
  onUpgrade: (plan: "creator" | "enterprise") => void;
  onSwitchUserEmail: (email: string) => void;
  onOpenStudio: () => void;
  onOpenHome: () => void;
}

export function UserDashboard({
  user,
  plans,
  paypalSettings,
  onUpgrade,
  onSwitchUserEmail,
  onOpenStudio,
  onOpenHome
}: UserDashboardProps) {
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showMarketComparison, setShowMarketComparison] = useState(false);

  const currentPlan = plans[user.tier];
  const percentUsed = Math.min(100, Math.round((user.downloadsUsed / user.downloadsLimit) * 100));
  const remaining = Math.max(0, user.downloadsLimit - user.downloadsUsed);

  const handleSwitchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onSwitchUserEmail(emailInput.trim());
      setIsSwitching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Banner & Account Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg font-mono">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-slate-900">{user.name}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                user.tier === "enterprise"
                  ? "bg-slate-900 text-white"
                  : user.tier === "creator"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {currentPlan.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user.email} <span aria-hidden="true">·</span> Member since {new Date(user.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenHome}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            ← Back to Home
          </button>
          <button
            type="button"
            onClick={() => setShowMarketComparison(!showMarketComparison)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              showMarketComparison
                ? "bg-violet-50 border-violet-300 text-violet-800"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
            <span>Market Intel</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSwitching(!isSwitching)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Switch Account
          </button>
          <button
            type="button"
            onClick={onOpenStudio}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Film className="h-3.5 w-3.5" />
            <span>Launch Studio</span>
          </button>
        </div>
      </div>

      {/* Switch User Form (Collapsible) */}
      {isSwitching && (
        <form onSubmit={handleSwitchSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-2 items-center text-xs">
          <label className="text-slate-600 font-semibold shrink-0">Sign in with email:</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="your-email@creator.com"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500 w-full"
            required
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition cursor-pointer shrink-0"
          >
            Load User Profile
          </button>
        </form>
      )}

      {/* Usage Meter Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Download Quota & Usage
            </h3>
            <p className="text-xs text-slate-500">
              Track remaining video downloads for your current {currentPlan.interval}ly billing cycle.
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-slate-700">
            Resets on: <span className="text-violet-700">{new Date(user.cycleResetDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">
              Used {user.downloadsUsed} of {user.downloadsLimit} downloads ({percentUsed}%)
            </span>
            <span className={remaining === 0 ? "text-rose-600 font-bold" : "text-emerald-700"}>
              {remaining} remaining {user.tier === "free" ? "this week" : "this month"}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentUsed >= 100
                  ? "bg-rose-500"
                  : percentUsed > 75
                  ? "bg-amber-500"
                  : "bg-violet-600"
              }`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
        </div>

        {remaining === 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              You have used all {user.downloadsLimit} downloads for your current plan cycle. Upgrade below to immediately unlock additional volume!
            </p>
          </div>
        )}
      </div>

      {/* Plan Features & Upgrade Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-600" />
            Current Plan Inclusions
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {currentPlan.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div>Batch (5-at-once) downloads: <strong>{currentPlan.allowBatch ? "Enabled" : "Locked (Paid only)"}</strong></div>
            <div>Lifetime videos processed: <strong>{user.totalVideosProcessed} videos</strong></div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-violet-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-400/20 text-violet-200">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>Scale Your Output</span>
            </div>

            <h3 className="font-display font-bold text-xl text-white">
              {user.tier === "free" ? "Upgrade to Creator Tier" : "Need More Volume? Get Enterprise"}
            </h3>

            <p className="text-xs text-violet-200/90 leading-relaxed">
              {user.tier === "free"
                ? "Unlock 35 videos/month, batch multi-clip downloads, full 9:16 video exports, and priority rendering for just $9/mo."
                : "Get 400 videos/month with enterprise priority rendering pipeline for $99/mo."}
            </p>
          </div>

          <div className="space-y-2">
            {user.tier === "free" ? (
              <button
                type="button"
                onClick={() => onUpgrade("creator")}
                className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
              >
                Upgrade to Creator ($9 / month)
              </button>
            ) : user.tier === "creator" ? (
              <button
                type="button"
                onClick={() => onUpgrade("enterprise")}
                className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
              >
                Upgrade to Enterprise ($99 / month)
              </button>
            ) : (
              <div className="text-center text-xs text-emerald-300 font-semibold py-2">
                ✓ You are on the top-tier Enterprise Plan (400 videos/mo)
              </div>
            )}

            {user.tier === "free" && paypalSettings.creatorPayPalLink && (
              <a
                href={paypalSettings.creatorPayPalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-violet-200 hover:underline flex items-center justify-center gap-1 text-center"
              >
                <span>Checkout with PayPal link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Market Intelligence / Comparison Section */}
      {showMarketComparison && (
        <div className="pt-2 animate-fade-in">
          <MarketComparison
            onOpenPricing={onOpenHome}
            onOpenStudio={onOpenStudio}
          />
        </div>
      )}
    </div>
  );
}
