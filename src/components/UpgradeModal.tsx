import { useState } from "react";
import { X, Check, Zap, Sparkles, ExternalLink, Award, Tag } from "lucide-react";
import { PlanConfig, PayPalSettings, OneTimePack, DEFAULT_ONE_TIME_PACKS } from "../types";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  creatorPlan: PlanConfig;
  enterprisePlan: PlanConfig;
  paypalSettings: PayPalSettings;
  oneTimePacks?: OneTimePack[];
  onUpgrade: (plan: "creator" | "enterprise", billingCycle?: "monthly" | "annual") => void;
  onBuyPack?: (packId: "pack_5" | "pack_25" | "pack_50") => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
  creatorPlan,
  enterprisePlan,
  paypalSettings,
  oneTimePacks,
  onUpgrade,
  onBuyPack
}: UpgradeModalProps) {
  const [modalMode, setModalMode] = useState<"monthly" | "annual" | "onetime">("monthly");
  const activePacks = oneTimePacks && oneTimePacks.length > 0 ? oneTimePacks : DEFAULT_ONE_TIME_PACKS;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/60">
            <Zap className="h-3.5 w-3.5 text-violet-600" />
            <span>Plan Upgrade or One-Time Pack Required</span>
          </div>

          <h3 className="font-display font-bold text-xl text-slate-900">
            Unlock 9:16 Video Downloads
          </h3>

          <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setModalMode("monthly")}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                modalMode === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setModalMode("annual")}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                modalMode === "annual" ? "bg-white text-emerald-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual
            </button>
            <button
              type="button"
              onClick={() => setModalMode("onetime")}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                modalMode === "onetime" ? "bg-violet-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              One Time
            </button>
          </div>
        </div>

        {/* Content based on selection */}
        {modalMode === "onetime" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activePacks.map((pack) => (
              <div
                key={pack.id}
                className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 ${
                  pack.popular
                    ? "border-2 border-violet-600 bg-violet-50/20 shadow-xs"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="space-y-1">
                  {pack.badge && (
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
                      {pack.badge}
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-slate-900">{pack.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">${pack.price}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({pack.pricePerVideo})</span>
                  </div>
                  <div className="text-xs font-semibold text-violet-700">
                    {pack.videoCredits} downloads (Never expire)
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 pt-1">
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-violet-600 shrink-0" />
                      <span>No monthly charge</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-violet-600 shrink-0" />
                      <span>Batch 5-clip export</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onBuyPack) onBuyPack(pack.id);
                    onClose();
                  }}
                  className={`w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs ${
                    pack.popular
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  Get {pack.videoCredits} Vids (${pack.price})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Creator Tier */}
            {(() => {
              const isAnnual = modalMode === "annual";
              const price = isAnnual ? 86 : creatorPlan.price;
              const period = isAnnual ? "/ year (Save $22)" : "/ month";

              return (
                <div className="border-2 border-violet-600 rounded-2xl p-5 bg-violet-50/20 flex flex-col justify-between space-y-4 relative">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">
                        Recommended
                      </span>
                      {isAnnual && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          20% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">${price}</span>
                      <span className="text-xs text-slate-500">{period}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {creatorPlan.downloadLimit} downloads / mo ({isAnnual ? "420 / year" : "35 / mo"})
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>Download all 5 clips at once</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>Full-length 9:16 export</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                        <span>High-speed 4K rendering</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpgrade("creator", isAnnual ? "annual" : "monthly");
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                    >
                      Upgrade Creator (${price})
                    </button>
                    {(() => {
                      const link = isAnnual
                        ? (paypalSettings.creatorAnnualPayPalLink || paypalSettings.creatorPayPalLink)
                        : (paypalSettings.creatorMonthlyPayPalLink || paypalSettings.creatorPayPalLink);
                      return link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-600 hover:underline flex items-center justify-center gap-1 text-center"
                        >
                          <span>Checkout via PayPal</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* Enterprise Tier */}
            {(() => {
              const isAnnual = modalMode === "annual";
              const price = isAnnual ? 950 : enterprisePlan.price;
              const period = isAnnual ? "/ year (Save $238)" : "/ month";

              return (
                <div className="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Agency / Studio
                      </span>
                      {isAnnual && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          20% OFF
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">${price}</span>
                      <span className="text-xs text-slate-500">{period}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      {enterprisePlan.downloadLimit} downloads / mo ({isAnnual ? "4,800 / year" : "400 / mo"})
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>400 video downloads / mo</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Priority server processing</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Unlimited commercial license</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpgrade("enterprise", isAnnual ? "annual" : "monthly");
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                    >
                      Upgrade Enterprise (${price})
                    </button>
                    {(() => {
                      const link = isAnnual
                        ? (paypalSettings.enterpriseAnnualPayPalLink || paypalSettings.enterprisePayPalLink)
                        : (paypalSettings.enterpriseMonthlyPayPalLink || paypalSettings.enterprisePayPalLink);
                      return link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-600 hover:underline flex items-center justify-center gap-1 text-center"
                        >
                          <span>Checkout via PayPal</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
