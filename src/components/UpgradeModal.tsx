import { X, Check, Zap, Sparkles, ExternalLink } from "lucide-react";
import { PlanConfig, PayPalSettings } from "../types";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  creatorPlan: PlanConfig;
  enterprisePlan: PlanConfig;
  paypalSettings: PayPalSettings;
  onUpgrade: (plan: "creator" | "enterprise") => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
  creatorPlan,
  enterprisePlan,
  paypalSettings,
  onUpgrade
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/80 space-y-6 relative">
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
            <span>SaaS Plan Upgrade Required</span>
          </div>

          <h3 className="font-display font-bold text-xl text-slate-900">
            Unlock Full 9:16 Video Downloads
          </h3>

          <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Plan Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Creator Tier */}
          <div className="border-2 border-violet-600 rounded-2xl p-5 bg-violet-50/20 flex flex-col justify-between space-y-4 relative">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider block">Recommended</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">${creatorPlan.price}</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {creatorPlan.downloadLimit} video downloads / month
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <span>Download all 5 clips at once</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <span>Entire video 9:16 export</span>
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
                  onUpgrade("creator");
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                Upgrade Creator (${creatorPlan.price})
              </button>
              {paypalSettings.creatorPayPalLink && (
                <a
                  href={paypalSettings.creatorPayPalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-violet-600 hover:underline flex items-center justify-center gap-1 text-center"
                >
                  <span>PayPal link</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Agency / Studio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">${enterprisePlan.price}</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {enterprisePlan.downloadLimit} video downloads / month
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
                  onUpgrade("enterprise");
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                Upgrade Enterprise (${enterprisePlan.price})
              </button>
              {paypalSettings.enterprisePayPalLink && (
                <a
                  href={paypalSettings.enterprisePayPalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-600 hover:underline flex items-center justify-center gap-1 text-center"
                >
                  <span>PayPal link</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
