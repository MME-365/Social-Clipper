import { useState, FormEvent } from "react";
import {
  DollarSign,
  Users,
  Film,
  Settings,
  CreditCard,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Sliders
} from "lucide-react";
import { AdminOverview, PlanConfig, PayPalSettings } from "../types";

interface AdminPanelProps {
  overview: AdminOverview;
  onUpdateConfig: (newPlans: AdminOverview["plans"], paypalSettings: PayPalSettings) => Promise<void>;
  onUpdateUser: (email: string, tier?: "free" | "creator" | "enterprise", resetDownloads?: boolean) => Promise<void>;
}

export function AdminPanel({
  overview,
  onUpdateConfig,
  onUpdateUser
}: AdminPanelProps) {
  const [plans, setPlans] = useState(overview.plans);
  const [paypalSettings, setPaypalSettings] = useState(overview.paypalSettings);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pricing" | "paypal" | "transactions" | "users">("pricing");

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingStatus("Saving configuration...");
    try {
      await onUpdateConfig(plans, paypalSettings);
      setSavingStatus("Saved successfully!");
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (err) {
      setSavingStatus("Failed to save changes.");
      setTimeout(() => setSavingStatus(null), 3000);
    }
  };

  const filteredUsers = overview.users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-display font-bold text-lg text-slate-900">SaaS Admin Control Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage packages, pricing, download limits, PayPal payment links, and live transactions.
          </p>
        </div>

        {savingStatus && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 animate-pulse">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>{savingStatus}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-1 text-2xl font-extrabold text-slate-900">
            <span>${overview.stats.totalRevenue}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Real-time PayPal balance</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {overview.stats.totalUsers}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">{overview.stats.paidUsers} paid subscribers</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Paid Conversion
          </span>
          <div className="text-2xl font-extrabold text-violet-700">
            {overview.stats.totalUsers > 0 ? Math.round((overview.stats.paidUsers / overview.stats.totalUsers) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Creator & Enterprise</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Videos Processed
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {overview.stats.totalDownloads}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Across all accounts</span>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "pricing"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Pricing & Quota Limits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("paypal")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "paypal"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>PayPal Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "transactions"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Transactions History ({overview.transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Accounts ({overview.users.length})</span>
        </button>
      </div>

      {/* Tab 1: Pricing & Download Limits Controller */}
      {activeTab === "pricing" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Package Prices & Download Limits
            </h3>
            <p className="text-xs text-slate-500">
              Configure how much each tier costs and how many video downloads users get per cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier Config */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-slate-800 uppercase block">Free Starter Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Week</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={plans.free.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      free: { ...plans.free, downloadLimit: parseInt(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Batch 5-clip downloads: <strong className="text-rose-600">Locked</strong>
              </div>
            </div>

            {/* Creator Tier Config */}
            <div className="bg-violet-50/50 border border-violet-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-violet-900 uppercase block">Creator Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  min="1"
                  value={plans.creator.price}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      creator: { ...plans.creator, price: parseInt(e.target.value) || 9 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Month</label>
                <input
                  type="number"
                  min="5"
                  value={plans.creator.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      creator: { ...plans.creator, downloadLimit: parseInt(e.target.value) || 35 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Enterprise Tier Config */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-slate-800 uppercase block">Enterprise Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  min="10"
                  value={plans.enterprise.price}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      enterprise: { ...plans.enterprise, price: parseInt(e.target.value) || 99 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Month</label>
                <input
                  type="number"
                  min="50"
                  value={plans.enterprise.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      enterprise: { ...plans.enterprise, downloadLimit: parseInt(e.target.value) || 400 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Pricing & Quota Limits</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: PayPal Payment Links Settings */}
      {activeTab === "paypal" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              PayPal Links & Merchant Inputs
            </h3>
            <p className="text-xs text-slate-500">
              Paste your official PayPal Checkout or Subscription buttons URL for Creator and Enterprise plans.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Creator Plan PayPal Payment URL ($9/mo)
              </label>
              <input
                type="url"
                value={paypalSettings.creatorPayPalLink}
                onChange={(e) =>
                  setPaypalSettings({ ...paypalSettings, creatorPayPalLink: e.target.value })
                }
                placeholder="https://www.paypal.com/ncp/payment/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enterprise Plan PayPal Payment URL ($99/mo)
              </label>
              <input
                type="url"
                value={paypalSettings.enterprisePayPalLink}
                onChange={(e) =>
                  setPaypalSettings({ ...paypalSettings, enterprisePayPalLink: e.target.value })
                }
                placeholder="https://www.paypal.com/ncp/payment/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Merchant Email</label>
                <input
                  type="email"
                  value={paypalSettings.merchantEmail}
                  onChange={(e) =>
                    setPaypalSettings({ ...paypalSettings, merchantEmail: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">PayPal Client ID (Optional)</label>
                <input
                  type="text"
                  value={paypalSettings.paypalClientId}
                  onChange={(e) =>
                    setPaypalSettings({ ...paypalSettings, paypalClientId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save PayPal Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Transactions History */}
      {activeTab === "transactions" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Payment Transactions History
              </h3>
              <p className="text-xs text-slate-500">Live feed of all customer upgrades and PayPal orders.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              Total: ${overview.stats.totalRevenue} USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Customer Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">PayPal Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">{tx.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{tx.userEmail}</td>
                    <td className="py-3 px-3 capitalize">
                      <span className="font-semibold text-violet-700">{tx.plan}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">${tx.amount}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">{tx.paypalTransactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts Manager */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                User Accounts & Tier Management
              </h3>
              <p className="text-xs text-slate-500">Adjust user subscriptions, override tiers, and reset monthly download quotas.</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user email..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Current Tier</th>
                  <th className="py-2.5 px-3">Usage</th>
                  <th className="py-2.5 px-3">Lifetime Videos</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={u.tier}
                        onChange={(e) => onUpdateUser(u.email, e.target.value as any)}
                        className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="free">Free Starter</option>
                        <option value="creator">Creator ($9/mo)</option>
                        <option value="enterprise">Enterprise ($99/mo)</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {u.downloadsUsed} / {u.downloadsLimit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.downloadsLimit - u.downloadsUsed} remaining
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{u.totalVideosProcessed || 0}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => onUpdateUser(u.email, undefined, true)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                        title="Reset downloads used to 0"
                      >
                        Reset Quota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
